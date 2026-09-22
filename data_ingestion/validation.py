import json
import datetime
from typing import List, Dict, Any, Tuple

def validate_dataset(records: List[Dict[str, Any]], required_fields: List[str]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any]]:
    accepted = []
    rejected = []
    failures = []
    
    # Track duplicates by a crude hashing approach if no PK exists
    seen = set()
    
    for idx, row in enumerate(records):
        row_failures = []
        for field in required_fields:
            if field not in row or row[field] is None or row[field] == "":
                row_failures.append(f"Missing required field: {field}")
                
        # Check duplicate
        row_hash = hash(json.dumps(row, sort_keys=True))
        if row_hash in seen:
            row_failures.append("Duplicate record")
        else:
            seen.add(row_hash)
            
        if row_failures:
            rejected.append(row)
            failures.append({"index": idx, "reasons": row_failures})
        else:
            accepted.append(row)
            
    summary = {
        "rows_received": len(records),
        "rows_accepted": len(accepted),
        "rows_rejected": len(rejected),
        "validation_failures": failures,
        "warnings": [],
        "schema_version": "1.0",
        "validation_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    return accepted, rejected, summary
