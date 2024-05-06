**Implementation of CCS'2022 paper "Hidden in Plain Sight: Exploring Encrypted Channels in Android Apps"**

- For inspiration only: This tool is not ready to use out of the box and requires some modification.
  - It mainly requires modification of the device.py file. Primarily, focus on the window and activity.
- There are no plans to maintain, develop, or provide support for this tool.
-----
```
flame:/ # mkdir /data/crontab
flame:/ # echo '* * * * * svc wifi enable' >> /data/crontab/root
flame:/ # echo '* * * * * settings put global airplane_mode_on 0' >> /data/crontab/root
flame:/ # echo 'crond -b -c /data/crontab' > /data/adb/service.d/crond.sh
flame:/ # chmod +x /data/adb/service.d/crond.sh
settings put global captive_portal_mode 0 

adb shell content insert --uri content://settings/system --bind name:s:accelerometer_rotation --bind value:i:0
```
