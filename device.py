import hashlib
import json
import logging
import math
import os
import subprocess
import sys
import time

import frida
from com.dtmilano.android.adb.adbclient import AdbClient
from com.dtmilano.android.viewclient import ViewClient
from uiautomator import device

import exceptions
import interactor
import timeout

# adb shell ime list -s -a
# adb shell ime set com.apedroid.hwkeyboardhelperfree/.HWKeyboardHelperIME


def get_active_devices():
    devices = list()
    for d in AdbClient().getDevices():
        transport_id = [i for i in d.qualifiers if i.startswith(
            'transport_id:')][0][13:]
        devices.append(Device(AdbClient(serialno=d.serialno), transport_id))
        logging.debug(d.serialno)
    if devices == []:
        raise exceptions.DeviceNotFound
    return devices


class Device:
    def __init__(self, d, transport_id):
            
        self.d = d
        self.transport_id = transport_id
        self.shell = lambda c: self.d.shell(c).strip()
        self.alive = True
        self.info = {}
        self.update_info()
        self.frida = list(d for d in frida.get_device_manager(
        ).enumerate_devices() if d.id in (self.d.serialno, self.info["ro.serialno"]))[0]
        self.close_all_apps()
        self.vc = ViewClient(*(self.d, self.d.serialno))
        self.display = Display(self)
        self.permissions = self.get_device_permissions()

    def second(self):
        self.frida = list(d for d in frida.get_device_manager().enumerate_devices(
        ) if d.id in (self.d.serialno, self.info["ro.serialno"]))[0]

    def get_device_permissions(self):
        return set(p[11:] for p in self.shell("pm list permissions").splitlines() if p.startswith("permission:"))

    def get_app_permissions(self, package):
        dumpsys = self.shell("dumpsys package "+package).splitlines()
        l = {"android.permission.SYSTEM_ALERT_WINDOW"}
        a = str()
        f = False

        for i, r in enumerate(dumpsys):
            if r.startswith((" "*6)+"android.service.notification.NotificationListenerService") and dumpsys[i+1].startswith(" "*8) and dumpsys[i+1].endswith("BIND_NOTIFICATION_LISTENER_SERVICE"):
                a += "cmd notification allow_listener {};".format(
                    dumpsys[i+1][8:].split(' ')[1])
                break
        for i, r in enumerate(dumpsys):
            if r.startswith((" "*6)+"android.accessibilityservice.AccessibilityService") and dumpsys[i+1].startswith(" "*8) and dumpsys[i+1].endswith("BIND_ACCESSIBILITY_SERVICE"):
                a += "settings put secure enabled_accessibility_services {};".format(
                    dumpsys[i+1][8:].split(' ')[1])
                break
        for i in dumpsys:
            if i.startswith((" "*6)+"runtime permissions"):
                f = True
                continue
            if f and i.startswith(" "*8):
                if ' ' in i[8:]:
                    l.add(i[8:].split(': ')[0])
                else:
                    l.add(i[8:])
            else:
                f = False
        # print(l)
        return l, a
        # for i in self.shell("dumpsys package "+package).splitlines():
        #     if i.startswith((" "*4)+"requested permissions"):
        #         f = True
        #         continue
        #     if f and i.startswith(" "*6):
        #         if ' ' in i[6:]:
        #             l.add(i[6:].split(': ')[0])
        #         else:
        #             l.add(i[6:])
        #     else:
        #         f = False
        # return l

    def grant_app_permissions(self, package, perms=set(), service_name=str(), service=True):
        _perms = set()
        if len(perms) == 0:
            _perms, _service_name = self.get_app_permissions(package)
        else:
            _perms = perms
            _service_name = service_name
        for perm in _perms:
            self.shell("pm grant "+package+" "+perm)
        if _service_name:
            self.shell(_service_name)
        return _perms, _service_name

    def update_info(self):
        serialno = self.shell("getprop ro.serialno")
        if len(serialno) != 0:
            self.info["ro.serialno"] = serialno

    def is_alive(self):
        try:
            with timeout.timeout(seconds=20):
                if self.shell("echo alive") == "alive":
                    self.alive = True
                    return True
                else:
                    self.alive = False
                    return False
        except:
            self.alive = False
            return False

    def close_app(self, package):
        try:
            if self.shell("pm clear "+package) == "Success":
                return True
            else:
                return False
        except:
            return False

    def close_all_apps(self):
        packages = self.get_paused_activites()
        print(packages)
        if self.get_current_activity() != None:
            packages.add(self.get_current_activity())
        # packages.discard('com.android.launcher3/.lineage.LineageLauncher')
        packages.discard(
            'com.google.android.apps.nexuslauncher/.NexusLauncherActivity')
        packages.discard('com.google.android.apps.nexuslauncher/com.android.launcher3.settings.SettingsActivity')
        # packages.add('org.lineageos.jelly')
        # packages.add('com.android.chrome')
        print(packages)
        for package in packages:
            p = package.split("/")[0]
            if p == "com.google.android.apps.nexuslauncher":
                self.shell("am force-stop "+p)
            elif self.shell("pm clear "+p) != "Success":
                return False
        return True

    def close_paused_apps(self):
        for package in self.get_paused_activites():
            p = package.split("/")[0]
            if p == "com.google.android.apps.nexuslauncher":
                self.shell("am force-stop "+p)
            elif self.shell("pm clear "+p) != "Success":
                return False
        return True

    def uninstall_3rd_party_apps(self):
        self.shell("su -c killall tcpdump")
        packages = self.shell('pm list packages -3 | cut -c9- | grep -Ev "(com.apedroid.hwkeyboardhelperfree|com.github.shadowsocks|com.research.helper|org.proxydroid|com.fakemygps.android|org.meowcat.edxposed.manager|edu.berkeley.icsi.haystack|com.topjohnwu.magisk|app.greyshirts.sslcapture|tw.fatminmin.xposed.minminguard|com.cofface.ivader)"')
        for package in packages.splitlines():
            self.uninstall_app(package)

    def is_internet_available(self):
        # if "success" in self.shell(
        # "echo \"GET /success.txt\" | nc detectportal.firefox.com 80"):
        # if "success" in self.shell("curl --connect-timeout 2 detectportal.firefox.com/success.txt"):
        if "ttl=" in self.shell("ping -c 1 1.1.1.1"):
            return True
        return False

    def wait_if_internet_isnt_available(self):
        while self.is_internet_available() == False:
            logging.warning('Internet is not available, please wait')
            time.sleep(2)

    def is_app_crashed(self, app):
        current_focus = self.shell(
            "dumpsys activity activities | grep -E \"mCurrentFocus.+Application Error:.+"+app+"\"").split()
        if len(current_focus) > 0:
            return True
        else:
            return False

    def is_app_hangs(self, app):
        current_focus = self.shell(
            "dumpsys activity activities | grep -E \"mCurrentFocus.+Application Not Responding:.+"+app+"\"").split()
        if len(current_focus) > 0:
            return True
        else:
            return False

    def get_current_activity(self):
        # time.sleep(0.5)
        m_resumed_activity = self.shell(
            "dumpsys activity activities | grep mResumedActivity").split()
        print("00s00")
        print(m_resumed_activity)
        print("00s01")
        i = 0
        if len(m_resumed_activity) > 0:
            print("00s01-1")
            if m_resumed_activity in (["Can't", 'find', 'service:', 'activity']) or m_resumed_activity[0] == "Can't":
                print("00s01-2")
                os.system('kill -9 {pid}'.format(pid=os.getpid()))

        while m_resumed_activity in ([], ['mHoldScreenWindow=null']):
            if i > 8:
                return None
                break
            i += 1
            print(m_resumed_activity)
            print("00s11")
            # self.shell('input keyevent KEYCODE_POWER')
            self.shell('input keyevent KEYCODE_HOME')
            time.sleep(3)
            self.d.wake()
            m_resumed_activity = self.shell(
                "dumpsys activity activities | grep mResumedActivity").split()
            if m_resumed_activity == []:
                m_resumed_activity = self.shell(
                    "dumpsys window windows | grep mHoldScreenWindow").split()
            if m_resumed_activity in ([], ['mHoldScreenWindow=null']):
                m_resumed_activity = self.shell(
                    "dumpsys window windows | grep mActivityRecord | grep -v com.android.launcher3").split()
                print(m_resumed_activity)
            if len(m_resumed_activity) > 0:
                if m_resumed_activity in (["Can't", 'find', 'service:', 'activity']) or m_resumed_activity[0] == "Can't":
                    os.system('kill -9 {pid}'.format(pid=os.getpid()))
            # logging.debug("m_resumed_activity")
            # logging.debug(m_resumed_activity)

        # while m_resumed_activity == []:
        #     logging.debug(m_resumed_activity)
        #     time.sleep(0.5)
        #     m_resumed_activity = self.shell(
        #         "dumpsys activity activities | grep mResumedActivity").split()
        # logging.debug(m_resumed_activity)
        print(len(m_resumed_activity))
        if len(m_resumed_activity) > 2 and m_resumed_activity[0].startswith("mActivityRecord"):
            print(m_resumed_activity[2])
            return m_resumed_activity[2]
        if len(m_resumed_activity) > 4:
            print(m_resumed_activity[3])
            return m_resumed_activity[3]

    def get_paused_activites(self):
        return set(line.split()[3] for line in self.shell("dumpsys activity activities | grep mLastPausedActivity").splitlines())

    def get_package_window_hash(self, pkg):
        packages = self.get_paused_activites()
        if self.get_current_activity() != None:
            packages.add(self.get_current_activity())
        for package in packages:
            if package.startswith(pkg):
                return hashlib.sha256(self.shell("dumpsys window | grep "+pkg).encode("utf-8")).hexdigest()

    def pull(self, src, dst="./"):
        # logging.debug(src)
        final_path = dst+"/"+src.split("/").pop()
        try:
            apk_device_hash = self.shell("sha256sum"+" "+src).split()[0]
            logging.debug(apk_device_hash)
            logging.debug(src)
        except:
            return False

        if os.path.exists(final_path):
            with open(final_path, "rb") as f:
                if hashlib.sha256(f.read()).hexdigest() == apk_device_hash:
                    return True
        p = subprocess.Popen(
            ["adb", "-t", self.transport_id, "pull", src, dst],)
#                             stdout=subprocess.PIPE,)
        p.wait()
        with open(final_path, "rb") as f:
            if hashlib.sha256(f.read()).hexdigest() != apk_device_hash:
                return False
            return True

    def push(self, src, dst):
        # src_name = src.split("/").pop()
        with open(src, "rb") as f:
            fhash = hashlib.sha256(f.read()).hexdigest()
        p = subprocess.Popen(
            ["adb", "-t", self.transport_id, "push", src, dst],)
#                             stdout=subprocess.PIPE,)
        p.wait()
        try:
            apk_device_hash = self.shell(
                "sha256sum"+" "+dst+src.split("/").pop()).split()[0]
        except:
            return False
        if fhash != apk_device_hash:
            return False
        return True

    def start_capture(self, package):
        self.shell("rm -f /sdcard/*")
        self.shell("rm -f /data/local/tmp/*.pcap")
        return (subprocess.Popen(
            [
                "adb",
                "shell",
                "su",
                "-c",
                "tcpdump",
                "port not 5555",
                "-i",
                "wlan0",
                "-w",
                "/data/local/tmp/" + package + ".pcap",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        ), subprocess.Popen(
            [
                "mitmdump",
                "-w",
                "out/"+package+"/mitmdump",
                "--anticomp",
                "--listen-port",
                "8080",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        ))

    def file_readable(self, path):
        if (self.shell("if [ -r \""+path+"\" ] && [ -f \""+path+"\" ]; then echo True;fi") == "True"):
            return True
        else:
            return False

    def store_files(self, package, stage):
        outpath = "out/"+package+"/"
        filelines = []
        for f in os.listdir(outpath):
            if f.startswith('fs-') and f.endswith('.txt'):
                with open(outpath+f, 'r') as _f:
                    filelines += _f.readlines()
        recordes = [json.loads(i) for i in filelines if json.loads(i)[
            "function"] in ("open", "rename")]
        paths = ((i["path"] if i[
            "function"] == "open" else i["destination"]) for i in recordes)

        for p in paths:

            if self.file_readable(p):
                os.makedirs(outpath+"/files-"+str(stage) + "/" +
                            os.path.dirname(p), exist_ok=True)
                self.pull(p, outpath+"/files-"+str(stage) +
                          "/"+os.path.dirname(p)+"/")

    def stop_capture(self, p, mitm, package):
        p.kill()
        mitm.kill()
        # parents_of_dead_kids=$(ps -ef | grep [d]efunct  | awk '{print $3}' | sort | uniq | egrep -v '^1$'); echo "$parents_of_dead_kids" | xargs kill
        self.shell("su -c killall tcpdump")
        # logging.debug("x")
        self.pull("/data/local/tmp/" + package+".pcap", "out/"+package)
        subprocess.Popen(
            [
                "pcapfix",
                "out/" + package + "/"+package + ".pcap",
                "-o",
                "out/" + package + "/clean.pcap",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        ).wait()
        # tmp
        os.system(
            "echo $(ps -ef | grep [d]efunct | awk '{print $3}' | sort | uniq | grep mitmdump| egrep -v '^1$') | xargs kill -9")

    def install_app(self, package, output="out/", reinstall=True):  # multiple try
        if os.path.exists(output + package+"/"+package + ".pcap") or os.path.exists("out/" + package + ".fail"):
            return False
        self.shell("su -c 'pm disable com.android.chrome;pm disable com.google.android.youtube;pm disable com.google.android.calendar;pm disable com.google.android.apps.docs;pm disable com.google.android.apps.customization.pixel;pm disable com.google.android.gm;pm disable com.google.android.apps.tycho;pm disable com.google.android.calculator;pm disable com.google.android.markup;pm disable com.android.safetyregulatoryinfo;pm disable com.google.android.apps.wallpaper.pixel;pm disable com.google.android.videos;pm disable com.google.android.apps.youtube.music;pm disable com.google.pixel.dynamicwallpapers;pm disable com.google.ar.core;pm disable com.google.android.projection.gearhead;pm disable com.google.android.apps.tips;pm disable com.google.android.googlequicksearchbox;pm disable com.google.android.apps.safetyhub'")
        if self.is_app_exist(package) and reinstall:
            self.uninstall_app(package)
        elif self.is_app_exist(package) and reinstall == False:
            self.shell("su -c pm disable {package};".format(package=package))
            return True
        self.shell(
            "content insert --uri content://settings/system --bind name:s:accelerometer_rotation --bind value:i:0")
        if os.path.exists(output + package + "/base.apk"):  # debug
            apks = list(output + package + "/"+f for f in os.listdir(
                output + package) if f.endswith('.apk'))
            obbs = list(output + package + "/"+f for f in os.listdir(
                output + package) if f.endswith('.obb'))
            if apks:
                p = subprocess.Popen(
                    ["adb", "-t", self.transport_id,"install-multiple" , "-g"]+apks, stdout=subprocess.PIPE,)
                p.wait()
                try:
                    if "Success" in str(p.communicate()[0]):
                        if obbs:
                            self.shell("mkdir -p /sdcard/obb/"+package)
                            print(obbs)
                            if all([self.push(obb, "/sdcard/obb/"+package+"/") for obb in obbs]):
                                self.shell("mv /sdcard/obb/{} /sdcard/Android/obb/".format(package))
                                self.shell(
                                    "su -c pm disable {package};".format(package=package))
                                return True
                            else:
                                return False
                        self.shell(
                            "su -c pm disable {package};".format(package=package))
                        return True
                except:
                    return False
        else:
            if os.path.exists(output + package + ".fail"):
                return False
            gp = interactor.GooglePlay(self)
            for _ in range(0, 2):
                gpi = gp.install(package)
                if gpi == None or gpi == False:
                    with open(output + package + ".fail", 'w') as fp:
                        pass
                    return False
                elif gpi == True:
                    self.shell(
                        "su -c pm disable {package};".format(package=package))
                    return True
            pass
        pass

    def uninstall_app(self, package):
        self.shell(
            'for file in $(find /sdcard/ -maxdepth 1 ); do if [ $file != "/sdcard/DCIM" ] && [ $file != "/sdcard/" ]; then rm -rf "$file" ;fi;done;rm -rf /sdcard/*\ *')
        if self.is_app_exist(package) and self.shell("pm uninstall {package}".format(package=package)) == "Success":
            return True
        return False

    def is_app_open(self, package):
        try:
            current_activity = self.get_current_activity()
            print(current_activity)
            if self.get_current_activity() and (current_activity.startswith(package) or current_activity.startswith("com.google.android.gms/.common") or current_activity in ["com.google.android.gms/.signin.activity.ConsentActivity", "com.google.android.gms/.auth.uiflows.consent.BrowserConsentActivity", "com.google.android.gms/.auth.uiflows.addaccount.AccountIntroActivity", "com.android.permissioncontroller/.permission.ui.ReviewPermissionsActivity"]):
                return True
            return False
        except:
            return False

    def run_app(self, package, close=True):
        if close:
            self.close_all_apps()
        self.shell(
            "su -c pm enable {package};monkey -p {package} --pct-touch 100 1".format(package=package))
        # print("----------")
        time.sleep(1)
        if not self.is_app_open(package):
            return True
        else:
            return False

    def is_app_exist(self, package):
        for exsited_package in self.shell("cmd package list packages "+package).splitlines():
            if exsited_package.split(":", 1)[1] == package:
                return True
        return False

    def store_app(self, package, output="out/"):
        if os.path.exists(output + package+"/base.apk"):
            return
        if not os.path.exists(output + package):
            os.makedirs(output + package)
        obbs = list(map(lambda x: "/sdcard/Android/obb/"+package+"/"+x,
                    self.shell("ls -1 /sdcard/Android/obb/"+package+"/").split("\n")))
        if "No such" in obbs[0]:
            obbs.clear()
        apks = list(map(lambda x: x[8:], self.shell(
            "pm path "+package).split("\n")))
        for i in obbs+apks:
            while True:
                try:
                    with timeout.timeout(seconds=120):
                        logging.debug("t2")
                        print(i, output + package)
                        if self.pull(i, output + package) == True:
                            break
                except:
                    subprocess.Popen(["killall", "adb"],
                                     stdout=subprocess.PIPE,).wait()
                    subprocess.Popen(
                        ["rm", "-rf", output + package], stdout=subprocess.PIPE,).wait()
                    # sys.exit()
                    os.system('kill -9 {pid}'.format(pid=os.getpid()))

    def start_interaction(self, package, stage, analysis_time):
        # try:
        if not self.is_app_open(package):
            self.run_app(package)
        interaction = interactor.App(self, package, stage, analysis_time)
        interaction.smart()
        # except:
        #     with open("out/"+package+"/animat.txt", "a") as f:
        #         f.write(str(stage)+"-"+str(int(time.time()))+"\n")
        #     return False
        #     # The views are being refreshed too frequently to dump.
        #     logging.debug("xx")


class Display:
    def __init__(self, device):
        self.density = int(device.shell("wm density").split(" ")[-1])
        (x, y) = device.shell("wm size").split(" ")[-1].split("x")
        self.x = int(x)
        self.y = int(y)
        self.statusbar = math.ceil(self.density/160)*24


# adb shell content query --uri content://com.android.contacts/data --projection display_name:data1:data4:contact_id
# adb shell "su -c 'sqlite3 /data/data/com.android.providers.contacts/databases/calllog.db \"select * from calls\"'"
