import time
from app.core.celery_app import test_task_success, test_task_failure_retry

def run_tests():
    print("Submitting success task...")
    res = test_task_success.delay(5)
    
    # Wait for result
    for i in range(10):
        if res.ready():
            break
        time.sleep(1)
        
    print(f"Task status: {res.status}")
    print(f"Task result: {res.result}")
    
    assert res.result == 10
    
    print("Submitting retry task...")
    res2 = test_task_failure_retry.delay()
    for i in range(15):
        if res2.ready():
            break
        print(f"Waiting... status: {res2.status}")
        time.sleep(1)
        
    print(f"Task status: {res2.status}")
    print(f"Task result: {res2.result}")
    assert res2.result == "Success after retry"
    print("Celery tests passed.")

if __name__ == "__main__":
    run_tests()
