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

    file_bytes = await file.read()
    
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
        
    url = storage.get_signed_url(dv.storage_key, expires_in_sec=300)
    return {"signed_url": url}
