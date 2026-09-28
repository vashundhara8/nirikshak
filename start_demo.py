#!/usr/bin/env python3
"""
NIRIKSHAK — One-Command Demo Startup Script
Starts backend + frontend in the correct order with health checks.

Usage:
    python start_demo.py            # Start both servers
    python start_demo.py --seed     # Start + seed demo data
    python start_demo.py --stop     # Kill running servers
"""

import subprocess
import sys
import time
import os
import argparse
import signal
import requests
from pathlib import Path

ROOT = Path(__file__).parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"

BACKEND_PORT = 8000
FRONTEND_PORT = 3000
BACKEND_URL = f"http://127.0.0.1:{BACKEND_PORT}/api/v1/health"

GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

processes = []

def banner():
    print(f"""
{BOLD}{CYAN}
  ███╗   ██╗██╗██████╗ ██╗██╗  ██╗███████╗██╗  ██╗ █████╗ ██╗  ██╗
  ████╗  ██║██║██╔══██╗██║██║ ██╔╝██╔════╝██║  ██║██╔══██╗██║ ██╔╝
  ██╔██╗ ██║██║██████╔╝██║█████╔╝ ███████╗███████║███████║█████╔╝ 
  ██║╚██╗██║██║██╔══██╗██║██╔═██╗ ╚════██║██╔══██║██╔══██║██╔═██╗ 
  ██║ ╚████║██║██║  ██║██║██║  ██╗███████║██║  ██║██║  ██║██║  ██╗
  ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
{RESET}
{BOLD}  Scholarship Verification & Lifecycle Platform{RESET}
{CYAN}  Ministry of Tribal Affairs — Government of India{RESET}
{BOLD}  ─────────────────────────────────────────────{RESET}
""")

def log(level, msg):
    icons = {"INFO": f"{CYAN}ℹ{RESET}", "OK": f"{GREEN}✓{RESET}", "WARN": f"{YELLOW}⚠{RESET}", "ERR": f"{RED}✗{RESET}"}
    print(f"  {icons.get(level, '·')} {msg}")

def wait_for_backend(timeout=30):
    log("INFO", f"Waiting for backend to start on port {BACKEND_PORT}...")
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = requests.get(BACKEND_URL, timeout=2)
            if r.status_code == 200:
                return True
        except Exception:
            pass
        time.sleep(1)
    return False

def start_backend():
    log("INFO", "Starting FastAPI backend...")
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", str(BACKEND_PORT), "--host", "127.0.0.1"],
        cwd=str(BACKEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0
    )
    processes.append(("Backend", proc))
    return proc

def start_frontend():
    log("INFO", "Starting Next.js frontend...")
    proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(FRONTEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=True if sys.platform == "win32" else False,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0
    )
    processes.append(("Frontend", proc))
    return proc

def seed_demo():
    log("INFO", "Seeding demo data...")
    result = subprocess.run(
        [sys.executable, "scripts/seed_demo.py"],
        cwd=str(ROOT),
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        log("OK", "Demo data seeded successfully")
    else:
        log("WARN", f"Seed partial or failed: {result.stderr[:200]}")

def shutdown(sig=None, frame=None):
    print(f"\n{YELLOW}  Shutting down NIRIKSHAK...{RESET}")
    for name, proc in processes:
        try:
            if sys.platform == "win32":
                proc.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                proc.terminate()
            log("OK", f"{name} stopped")
        except Exception:
            pass
    sys.exit(0)

def main():
    parser = argparse.ArgumentParser(description="NIRIKSHAK Demo Startup")
    parser.add_argument("--seed", action="store_true", help="Seed demo data after starting")
    parser.add_argument("--backend-only", action="store_true", help="Only start backend")
    parser.add_argument("--frontend-only", action="store_true", help="Only start frontend")
    args = parser.parse_args()

    signal.signal(signal.SIGINT, shutdown)
    if sys.platform != "win32":
        signal.signal(signal.SIGTERM, shutdown)

    banner()

    print(f"{BOLD}  Starting services...{RESET}\n")

    if not args.frontend_only:
        start_backend()
        backend_ok = wait_for_backend(timeout=35)
        if backend_ok:
            log("OK", f"Backend running → http://127.0.0.1:{BACKEND_PORT}")
            log("OK", f"API Docs         → http://127.0.0.1:{BACKEND_PORT}/docs")
        else:
            log("ERR", "Backend did not start in time. Check logs above.")

    if not args.backend_only:
        start_frontend()
        time.sleep(4)
        log("OK", f"Frontend starting → http://localhost:{FRONTEND_PORT}")

    if args.seed:
        time.sleep(3)
        seed_demo()

    print(f"""
{BOLD}  ─────────────────────────────────────────────{RESET}
{GREEN}{BOLD}  🚀 NIRIKSHAK is running!{RESET}

{CYAN}  Frontend  →  http://localhost:{FRONTEND_PORT}{RESET}
{CYAN}  Backend   →  http://127.0.0.1:{BACKEND_PORT}{RESET}
{CYAN}  API Docs  →  http://127.0.0.1:{BACKEND_PORT}/docs{RESET}

{BOLD}  Demo Accounts:{RESET}
  Applicant  →  Mobile: 9999999999 | OTP: 111111 (dev mode)
  Officer    →  Mobile: 9999999998 | OTP: 111111 (dev mode)
  Admin      →  Mobile: 9999999997 | OTP: 111111 (dev mode)

{YELLOW}  Press Ctrl+C to stop all services{RESET}
{BOLD}  ─────────────────────────────────────────────{RESET}
""")

    # Keep alive — stream backend logs to console
    try:
        backend_proc = next((p for n, p in processes if n == "Backend"), None)
        if backend_proc:
            for line in iter(backend_proc.stdout.readline, b""):
                decoded = line.decode("utf-8", errors="replace").rstrip()
                if decoded and not decoded.startswith("INFO:"):
                    print(f"  {CYAN}[backend]{RESET} {decoded}")
    except KeyboardInterrupt:
        shutdown()

if __name__ == "__main__":
    main()
