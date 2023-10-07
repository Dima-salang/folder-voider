
    schtasks /create /tn "folderVoider_hello" /tr "node 'C:\Users\Luis\Documents\Electron\FolderVoider\voids\folderVoider_hello_voider.bat'" /sc "Daily" /st "13:00" /ru "SYSTEM"
  