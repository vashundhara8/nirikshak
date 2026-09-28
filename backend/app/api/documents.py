from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import uuid

from app.db.session import get_db
from app.models.identity import User
from app.models.application import Application
from app.models.document import Document, DocumentVersion
from app.api.dependencies import get_current_user, RoleChecker
from app.core.storage import get_storage_provider, DocumentStorage
from app.core.scanner import get_security_scanner, calculate_checksum
from app.models.verification import Deficiency
from datetime import datetime, timezone

router = APIRouter()

@router.post("/applications/{application_id}/documents", status_code=status.HTTP_201_CREATED)
async def upload_document(
    application_id: uuid.UUID,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["APPLICANT", "INSTITUTE_OFFICER"])),
    storage: DocumentStorage = Depends(get_storage_provider)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
        
    if "APPLICANT" in [r.name for r in user.roles] and app.applicant_id != user.id:
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")

    MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB
    file_bytes = await file.read(MAX_FILE_SIZE + 1)
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="DOCUMENT_TOO_LARGE")

    # 1. Security Scan
    scanner = get_security_scanner()
    is_safe, reason = scanner.scan_document(file_bytes, file.filename)
    if not is_safe:
        raise HTTPException(status_code=400, detail=reason)
        
    # 2. Checksum
    checksum = calculate_checksum(file_bytes)

    # 3. Store file safely
    storage_key = storage.save_document(file_bytes, file.filename)
    
    # 4. Create Document Group if not exists
    doc = db.query(Document).filter(
        Document.application_id == application_id,
        Document.document_type == document_type
    ).first()
    
    if not doc:
        doc = Document(application_id=application_id, document_type=document_type)
        db.add(doc)
        db.flush()
        
    # 5. Determine version number
    version_count = db.query(DocumentVersion).filter(DocumentVersion.document_id == doc.id).count()
    new_version_num = version_count + 1
    
    # 6. Create DocumentVersion
    doc_version = DocumentVersion(
        document_id=doc.id,
        version_number=new_version_num,
        storage_key=storage_key,
        file_hash=checksum,
        mime_type=file.content_type or "application/octet-stream",
        file_size=len(file_bytes),
        uploaded_by=user.id,
        status="UPLOADED"
    )
    db.add(doc_version)
    db.flush()
    
    doc.current_version_id = doc_version.id
    db.commit()
    
    return {"document_id": str(doc.id), "version_id": str(doc_version.id)}

@router.post("/applications/{application_id}/resubmit", status_code=status.HTTP_201_CREATED)
async def resubmit_document(
    application_id: uuid.UUID,
    deficiency_id: uuid.UUID = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["APPLICANT"])),
    storage: DocumentStorage = Depends(get_storage_provider)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app or app.applicant_id != user.id:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
        
    deficiency = db.query(Deficiency).filter(Deficiency.id == deficiency_id, Deficiency.application_id == application_id).first()
    if not deficiency or deficiency.status != "OPEN":
        raise HTTPException(status_code=400, detail="INVALID_DEFICIENCY")
        
    # Security Scan
    MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB
    file_bytes = await file.read(MAX_FILE_SIZE + 1)
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="DOCUMENT_TOO_LARGE")
        
    scanner = get_security_scanner()
    is_safe, reason = scanner.scan_document(file_bytes, file.filename)
    if not is_safe:
        raise HTTPException(status_code=400, detail=reason)
        
    checksum = calculate_checksum(file_bytes)
    storage_key = storage.save_document(file_bytes, file.filename)
    
    # Locate the Document record matching the deficiency type so we can add a new version
    doc = db.query(Document).filter(
        Document.application_id == application_id,
        Document.document_type == deficiency.deficiency_type # Assuming deficiency_type holds the doc type, or we could just use a generic resubmission type
    ).first()
    
    if not doc:
        doc = Document(application_id=application_id, document_type=deficiency.deficiency_type)
        db.add(doc)
        db.flush()
        
    version_count = db.query(DocumentVersion).filter(DocumentVersion.document_id == doc.id).count()
    
    doc_version = DocumentVersion(
        document_id=doc.id,
        version_number=version_count + 1,
        storage_key=storage_key,
        file_hash=checksum,
        mime_type=file.content_type or "application/octet-stream",
        file_size=len(file_bytes),
        uploaded_by=user.id,
        status="UPLOADED"
    )
    db.add(doc_version)
    db.flush()
    doc.current_version_id = doc_version.id
    
    deficiency.status = "CORRECTION_SUBMITTED"
    deficiency.resolved_at = datetime.now(timezone.utc)
    deficiency.resolution_notes = f"Resubmitted via document version {doc_version.id}"
    
    app.current_status = "RESUBMISSION_RECEIVED"
    
    # Audit log should be created here ideally
    db.commit()
    
    return {"document_id": str(doc.id), "version_id": str(doc_version.id), "deficiency_status": deficiency.status}

@router.get("/documents/{document_version_id}/download")
def download_document(
    document_version_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    storage: DocumentStorage = Depends(get_storage_provider)
):
    dv = db.query(DocumentVersion).filter(DocumentVersion.id == document_version_id).first()
    if not dv:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
        
    app = dv.document.application
    user_roles = [r.name for r in user.roles]
    
    # Strict Authorization
    if "APPLICANT" in user_roles and app.applicant_id != user.id:
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")
    elif "APPLICANT" not in user_roles and not any(r in user_roles for r in ["INSTITUTE_OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER"]):
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")
        
    # Audit access
    from app.models.document import DocumentAccess
    access_record = DocumentAccess(
        document_version_id=dv.id,
        user_id=user.id,
        reason="Presigned URL generation"
    )
    db.add(access_record)
    db.commit()
        
    url = storage.get_signed_url(dv.storage_key, expires_in_sec=300)
    return {"signed_url": url}

@router.get("/documents/vault")
def get_document_vault(
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["APPLICANT"]))
):
    # Fetch all documents across all applications for the user
    # We want unique document types, favoring the most recent uploaded_at
    docs = db.query(Document).join(Application).filter(Application.applicant_id == user.id).all()
    
    vault = {}
    for doc in docs:
        if not doc.current_version_id:
            continue
        v = db.query(DocumentVersion).filter(DocumentVersion.id == doc.current_version_id).first()
        if not v:
            continue
            
        dt = doc.document_type
        # If we already have a document of this type, keep the newer one
        if dt not in vault or vault[dt]["created_at"] < v.created_at:
            vault[dt] = {
                "document_id": str(doc.id),
                "version_id": str(v.id),
                "type": dt,
                "file_size": v.file_size,
                "created_at": v.created_at,
                "status": v.status,
                "is_digilocker": "digilocker" in dt.lower() # just a mock flag based on name if needed
            }
            
    return {"documents": list(vault.values())}

from fastapi.responses import Response

@router.get("/documents/dev-download/{storage_key}")
def dev_download_document(
    storage_key: str,
    storage: DocumentStorage = Depends(get_storage_provider)
):
    try:
        data = storage.get_document_bytes(storage_key)
        # We assume PDF here, although it could be PNG/JPEG depending on the upload. 
        # The browser will usually sniff the bytes or it doesn't matter too much for a new tab.
        return Response(content=data, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=404, detail="Not Found")
