import ctypes
import time
import os

def play_mci(file_path):
    winmm = ctypes.windll.winmm
    # Short path is required for MCI if there are spaces in the path
    # Get short path name
    buf = ctypes.create_unicode_buffer(260)
    ctypes.windll.kernel32.GetShortPathNameW(file_path, buf, 260)
    short_path = buf.value
    
    print(f"Playing via MCI: {short_path}")
    
    # Open the file
    winmm.mciSendStringW(f"open {short_path} alias my_music", None, 0, 0)
    # Play the file
    winmm.mciSendStringW("play my_music", None, 0, 0)
    
    # Get length
    status = ctypes.create_unicode_buffer(128)
    winmm.mciSendStringW("status my_music length", status, 128, 0)
    print(f"Length in ms: {status.value}")
    
    # Wait a bit
    time.sleep(5)
    
    # Stop and close
    winmm.mciSendStringW("stop my_music", None, 0, 0)
    winmm.mciSendStringW("close my_music", None, 0, 0)

if __name__ == "__main__":
    # Let's find any m4a or mp3 file and test it
    print("MCI Test Initialized")
