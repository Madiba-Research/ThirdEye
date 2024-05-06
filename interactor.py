import datetime
import hashlib
import itertools
import json
import logging
import os
import random
import sqlite3
import sys
import time
from functools import partial

import translators

import timeout

# pm list packages -3 | cut -d':' -f2 | tr '\r' ' ' | grep -v com.github.shadowsocks
# 1- adb reboot recovery
# 2- twrp wipe system ; twrp wipe dalvik ; twrp wipe data ; twrp wipe cache ; rm -rf /sdcard/*
# 3- adb push TWRP /sdcard/
# 4- twrp restore clean
# 5- rm -rf /sdcard/TWRP
# adb shell dumpsys window | grep com.android.vending
# adb shell dumpsys activity activities | grep mResumedActivity

# pm list packages -3 | cut -c9- | grep -Ev "(com.github.shadowsocks|org.proxydroid|com.fakemygps.android|org.meowcat.edxposed.manager|edu.berkeley.icsi.haystack|com.topjohnwu.magisk|app.greyshirts.sslcapture|tw.fatminmin.xposed.minminguard|com.cofface.ivader)" | xargs pm uninstall


def dictionary(text):
    en = text
    if len(text) > 2:
        con = sqlite3.connect('dict.db')
        cur = con.cursor()
        cur.execute(
            '''CREATE TABLE IF NOT EXISTS words (ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, original text, en text)''')
        cur.execute("select en from words where original = ?", (text,))
        row = cur.fetchone()

        if row == None:
            i = 0
            while i < 10:
                # print("zzz")
                # print(i)
                try:
                    with timeout.timeout(seconds=10):
                        en = translators.google(text)
                    break
                except:
                    i += 1
                    time.sleep(2)
                    continue
            logging.debug("dict")
            cur.execute("insert into words values (?,?,?)",
                        (None, text, en))
            con.commit()
        else:
            en = row[0]
        con.close()
    return en


def find_clickable_enable(view, text="", click=False, translate=True, exclude=["None"], obj_class=["android.widget.checkedtextview", "android.view.view", "android.widget.button", "android.widget.textview","android.widget.LinearLayout"], attr="text"):
    if (view.isClickable() or view.__getattr__('isEnabled')() or view.__getattr__('checkable')()) and view.getClass().lower() in obj_class:
        if attr.lower() == "text":
            # obj_text = (view.getText()).lower()
            obj_text = dictionary(view.getText()).lower(
            ) if translate else view.getText().lower()
        elif attr.lower() == "id":
            obj_text = view.getId().lower()
            if "/" in obj_text:
                obj_text = obj_text.split("/")[1]
        elif attr.lower() in ("cd","content-desc"):
            # obj_text = (view.getContentDescription()).lower()
            obj_text = dictionary(view.getContentDescription()).lower(
            ) if translate else view.getContentDescription().lower()
        else:
            return None
        text = text.lower()
        if (text == obj_text and exclude == ['None']) or (text in obj_text and len(obj_text) < 64 and (not any(substring in obj_text for substring in exclude) and exclude != ['None'])):
            if click:
                logging.debug("::"+text)
                view.touch()
            return True


def window_hash(root):
    id_list = [v.getId()
               for v in finder(root, lambda v: True if v.getId() else False)]
    id_list.sort()
    return hashlib.sha256(json.dumps(id_list).encode('utf-8')).hexdigest()


def problem(view):
    if view.getText().startswith("Can't download"):
        # "You're offline"
        return True


def finder(root, transform=str, nlist=None, count=[-1], window_hash="", memory=None):
    if memory is None:
        memory = dict()
    if nlist is None:
        nlist = []
    if not root or count[0] == 0 or (memory.get(window_hash) != None and (root.getUniqueId()+root.getId()+str(root.isClickable())+str(root.__getattr__('isEnabled')())) in memory.get(window_hash)):
        return
    if transform(root) and (window_hash == "" or memory.get(window_hash) == None or (root.getUniqueId()+root.getId()+str(root.isClickable())+str(root.__getattr__('isEnabled')())) not in memory.get(window_hash)):
        if count[0] != -1:
            count[0] -= 1
        nlist.append(root)
        if window_hash != "":
            if window_hash in memory:
                memory.get(window_hash).add(root.getUniqueId(
                )+root.getId()+str(root.isClickable())+str(root.__getattr__('isEnabled')()))
                # memory.update(
                #     {window_hash: {root.getUniqueId()+root.getId()}})
            else:
                memory.update(
                    {window_hash: {root.getUniqueId()+root.getId()+str(root.isClickable())+str(root.__getattr__('isEnabled')())}})

    for ch in root.children:
        finder(ch, transform=transform, nlist=nlist, count=count,
               window_hash=window_hash, memory=memory)
    return nlist


def get_root(device, window=-1, sleep=0.5):
    for chanse in range(0, 10):
        try:
            for n in device.vc.dump(window=window, sleep=sleep):
                if n.getParent() == None:
                    return n
        except Exception as e:
            if chanse < 3:
                time.sleep(2)
                continue
            raise e


class GooglePlay():
    def __init__(self, device):
        self.device = device

    def install(self, package):
        self.device.close_app("com.android.vending")
        self.device.wait_if_internet_isnt_available()
        self.open_package_page(package)
        # time.sleep(3)
        name = self.get_package_name()
        root = get_root(self.device)
        if None in (self.is_package_installable(package), self.get_package_name()) and finder(root, transform=partial(
                find_clickable_enable, text="Understood", click=True, translate=False)) == []:
            logging.debug(str(name) + " " + package)
            return None
        try:
            with timeout.timeout(seconds=200):
                uninstallable = 0
                while True:
                    if os.path.exists("./skip"):
                        os.remove("./skip")
                        return None
                    # self.device.close_app("com.android.chrome")
                    # self.device.close_app("org.lineageos.jelly")
                    logging.debug("4444")
                    self.device.wait_if_internet_isnt_available()
                    self.device.d.wake()
                    # time.sleep(2)
                    root = get_root(self.device)
                    if self.is_gp_open(root=root) == False or name != self.get_package_name():
                        self.open_package_page(package)

                    if finder(root, transform=partial(
                            find_clickable_enable, text="Open", translate=False)) or finder(root, transform=partial(
                            find_clickable_enable, text="Enable", translate=False)):
                        return True

                    if finder(root, transform=partial(
                            find_clickable_enable, text="Play", translate=False)):
                        return True

                    if finder(root, transform=partial(
                            find_clickable_enable, text="Uninstall", translate=False)):
                        if uninstallable >= 2:
                            return None
                        uninstallable += 1
                        continue

                    if finder(root, transform=partial(
                            find_clickable_enable, text="Install", click=True, translate=False)) or finder(root, transform=partial(
                            find_clickable_enable, text="Try again", click=True, translate=False)) or finder(root, transform=partial(
                            find_clickable_enable, text="Retry", click=True, translate=False)) or finder(root, transform=partial(
                            find_clickable_enable, text="Accept", click=True, translate=False)) or finder(root, transform=partial(
                            find_clickable_enable, text="Update", click=True, translate=False)) or finder(root, transform=partial(
                            find_clickable_enable, text="Skip", click=True, translate=False)) or finder(root, transform=partial(
                            find_clickable_enable, text="Accept", click=True, translate=False)) or finder(root, transform=partial(
                            find_clickable_enable, text="No thanks", click=True, translate=False)) or finder(root, transform=partial(
                            find_clickable_enable, text="Continue", click=True, translate=False)) or finder(root, transform=partial(
                            find_clickable_enable, text="Ok", click=True, translate=False)):
                        logging.debug("5555")
                        continue
                    if finder(root, transform=partial(
                            find_clickable_enable, text="Got it", click=True, translate=False)) or finder(root, transform=partial(
                            find_clickable_enable, text="Understood", click=True, translate=False)):
                        return None
        except:
            # return None
            self.device.d.wake()
            root = get_root(self.device)
            if self.is_gp_open(root=root) == False or name != self.get_package_name():
                self.open_package_page(package)
            if finder(root, transform=partial(find_clickable_enable, text="Cancel", click=True, translate=False)) or finder(root, transform=partial(find_clickable_enable, text="Uninstall", click=True, translate=False)):
                return None
            else:
                time.sleep(2)
                self.device.uninstall_app(package)
                return None

    def is_package_installable(self, package):
        if self.is_gp_open():
            items = [c.getText() for i in self.device.vc.dump() if i.getClass() == "android.view.ViewGroup" and i.getParent(
            ).getClass() != "android.widget.LinearLayout" for c in i.getChildren()]
            if "Install" in items or "Update" in items or "Open" in items:
                return True

    def is_package_installed(self, package, name):
        if self.is_gp_open() or name == self.get_package_name():
            if self.device.uiautomator(
                text="Open",
                className="android.widget.Button",
                clickable="true",
                enabled="true",
            ).exists:
                return True
        return False

    def is_gp_open(self, root='root'):
        if root == 'root':
            root = get_root(self.device)
            # google loading page hash
            while window_hash(root) == "bcdec05b796550fb1c36544f80af3d15dec9c4d4bcede57fe9187ab65ce632be":
                root = get_root(self.device)
        if self.device.get_current_activity() and self.device.get_current_activity().startswith("com.android.vending") and (not finder(root, transform=problem)):
            return True
        return False

    def get_package_name(self):
        if self.is_gp_open():
            _try = 0
            while _try < 2:
                while True:
                    root = get_root(self.device)
                    if (finder(root, transform=partial(
                            find_clickable_enable, text="Retry", click=True, translate=False)) or finder(root, transform=partial(
                                find_clickable_enable, text="Understood", click=True, translate=False)) or finder(root, transform=partial(
                                    find_clickable_enable, text="Skip", click=True, translate=False)) or finder(root, transform=partial(
                                        find_clickable_enable, text="Accept", click=True, translate=False)) or finder(root, transform=partial(
                                            find_clickable_enable, text="No, thanks", click=True, translate=False)) or finder(root, transform=partial(
                                                find_clickable_enable, text="Continue", click=True, translate=False)) or finder(root, transform=partial(
                                                    find_clickable_enable, text="Got it", click=True, translate=False))) == []:
                        logging.debug("7777")
                        break
                try:
                    return [i.getText() for i in self.device.vc.dump() if i.getClass() == "android.widget.TextView" and i.getParent().getClass() == "android.widget.LinearLayout"][0]
                except:
                    _try += 1
                    self.device.d.shell('input keyevent KEYCODE_BACK')
        # if not re.match(r'^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$', name):

    def open_package_page(self, package):
        self.device.d.wake()
        self.device.shell(
            "am start -a android.intent.action.VIEW -d 'market://details?id=" + package + "'")
        for _ in range(0, 5):
            time.sleep(0.5)
            if self.is_gp_open() == True:
                return True
        return False


# def remove_space(words):
#     nd = dict()
#     for key, value in words.items():
#         if ' ' in key:
#             nd[key.replace(' ', '')] = list(w.replace(' ', '')
#                                             if ' ' in w else w for w in value)
#             nd[key.replace(' ', '-')] = list(w.replace(' ', '-')
#                                              if ' ' in w else w for w in value)
#             nd[key.replace(' ', '_')] = list(w.replace(' ', '_')
#                                              if ' ' in w else w for w in value)
#         else:
#             nd[key] = list(itertools.chain.from_iterable([w.replace(' ', ''), w.replace(
#                 ' ', '_'), w.replace(' ', '-')] if ' ' in w else [w] for w in value))
#     return nd


class App:
    def __init__(self, device, package, stage, analysis_time, param_path="./interactor_parameters.json"):
        self.d = device
        self.p = package
        self.t = analysis_time
        self.stage = str(stage)
        self.memory = dict()
        with open(param_path, 'r') as file:
            self.params = json.loads(file.read())

    def get_params(self, text=True):
        if text:
            return self.params
        else:
            res = dict()
            for cat, val in self.params.items():
                nd = dict()
                for key, value in val.items():

                    if ' ' in key:
                        nd[key.replace(' ', '')] = value if type(value) is not list else list(w.replace(' ', '')
                                                                                              if ' ' in w else w for w in value)
                        nd[key.replace(' ', '-')] = value if type(value) is not list else list(w.replace(' ', '-')
                                                                                               if ' ' in w else w for w in value)
                        nd[key.replace(' ', '_')] = value if type(value) is not list else list(w.replace(' ', '_')
                                                                                               if ' ' in w else w for w in value)
                    else:
                        nd[key] = value if type(value) is not list else list(itertools.chain.from_iterable([w.replace(' ', ''), w.replace(
                            ' ', '_'), w.replace(' ', '-')] if ' ' in w else [w] for w in value))
                res[cat] = nd
            return res

    def find_and_click_by_text(self, root, obj_class):
        w_hash = window_hash(root)
        # print("----------")
        current_activity = self.d.get_current_activity()
        if current_activity in ["com.google.android.gms/.signin.activity.ConsentActivity", "com.google.android.gms/.auth.uiflows.consent.BrowserConsentActivity"]:
            if len(finder(root, transform=partial(find_clickable_enable, text="allow", click=True)) + finder(root, transform=partial(find_clickable_enable, text="continue", click=True))) == 0:
                w = self.d.d.display['width']
                h = self.d.d.display['height']
                s = (w / 2, (h / 3) * 2)
                e = (w / 2, (h / 3))
                self.d.d.drag(s, e, 500, 20, -1)
                self.d.d.drag(s, e, 500, 20, -1)
                # google found
                return True
            # time.sleep(1)
        elif current_activity in ["com.android.vending/com.google.android.finsky.activities.MarketDeepLinkHandlerActivity", "com.android.vending/com.google.android.finsky.billing.acquire.LockToPortraitUiBuilderHostActivity", "com.android.vending/com.google.android.finsky.billing.acquire.SheetUiBuilderHostActivity"] or current_activity.endswith("/com.google.android.gms.ads.AdActivity") or current_activity.endswith("/com.unity3d.services.ads.adunit.AdUnitActivity") or current_activity.endswith("/com.unity3d.ads.adunit.AdUnitActivity"):
            time.sleep(1.5)
            # com.android.vending/com.google.android.finsky.billing.acquire.SheetUiBuilderHostActivity
            print("////////////////")
            self.d.shell('input keyevent KEYCODE_BACK')
            return True
        for include, exclude in self.get_params()["keywords"].items():
            for node in finder(root, transform=partial(
                    find_clickable_enable, text=include, exclude=exclude, obj_class=obj_class, attr="CD"), count=[1], window_hash=w_hash, memory=self.memory):
                logging.debug("id12:"+include)
                node.touch()
                return True
        for include, exclude in self.get_params(text=False)["keywords"].items():
            for node in finder(root, transform=partial(
                    find_clickable_enable, text=include, exclude=exclude, obj_class=obj_class, attr="Id"), count=[1], window_hash=w_hash, memory=self.memory):
                logging.debug("id13:"+include)
                node.touch()
                return True
        for include, exclude in self.get_params()["keywords"].items():
            for node in finder(root, transform=partial(
                    find_clickable_enable, text=include, exclude=exclude, obj_class=obj_class), count=[1], window_hash=w_hash, memory=self.memory):
                node.touch()
                time.sleep(0.5)
                return True
            # print("----------1-2")
        # for include, exclude in self.get_params()["avoid"].items():
        #     for node in finder(root, transform=partial(
        #             find_clickable_enable, text=include, exclude=exclude, obj_class=obj_class), count=[1], window_hash=w_hash, memory=self.memory):
        #         # com.android.vending/com.google.android.finsky.activities.MarketDeepLinkHandlerActivity install
        #         # */com.google.android.gms.ads.AdActivity
        #         # com.android.vending/com.google.android.finsky.billing.acquire.LockToPortraitUiBuilderHostActivity
        #         logging.debug("id-----------------------------:"+node.getText())
        #         logging.debug("id11:"+include)
        #         print("--+++++++++++--"+self.d.get_current_activity())
        #         node.touch()
        #         return True
        time.sleep(1)
        return False

    def find_and_scroll(self, root):
        pass

    def find_input_and_fill(self, root, obj_class):
        w_hash = window_hash(root)
        for key, value in self.get_params()["input"].items():
            for node in finder(root, transform=partial(
                    find_clickable_enable, text=key, exclude=[], obj_class=obj_class), count=[1], window_hash=w_hash, memory=self.memory):
                logging.debug("id1:"+node.getId())
                node.setText(value)
                return True
        for key, value in self.get_params(text=False)["input"].items():
            for node in finder(root, transform=partial(
                    find_clickable_enable, text=key, exclude=[], obj_class=obj_class, attr="Id"), count=[1], window_hash=w_hash, memory=self.memory):
                logging.debug("id2:"+node.getId())
                logging.debug("v1:"+value)
                node.setText(value)
                return True
        # for node in finder(root, transform=partial(
        #         find_clickable_enable, text=key, obj_class=obj_class), count=[1], window_hash=w_hash, memory=self.memory):
        #     node.setText(value)
        #     return True
        return False

    def scroll_down(self, w, h):
        w = self.d.d.display['width']
        h = self.d.d.display['height']
        self.d.shell("input swipe {} {} {} {} 100".format(
            w / 2, (h / 3) * 2, w / 2, h / 3))

    def scroll_up(self, w, h):
        w = self.d.d.display['width']
        h = self.d.d.display['height']
        self.d.shell("input swipe {} {} {} {} 100".format(
            w / 2, h / 3, w / 2, (h / 3) * 2))

    def scroll_right(self, w, h):
        self.d.shell("input swipe {} {} {} {} 100".format(
            w / 5, h / 2, (w / 5 * 4), h / 2, 500, 20))

    def dumb_interaction(self, deep=False):
        click_command = ""
        w = int(self.d.display.y)
        h = int(self.d.display.x - self.d.display.statusbar)
        if bool(random.getrandbits(1)):
            self.scroll_up(w, h)
        else:
            self.scroll_down(w, h)
        self.scroll_right(w, h)
        if deep:
            base = (10, 5)
        else:
            base = (6, 3)
        for y in reversed(range(int(h/base[0]), h, int(h/base[0]))):
            for x in range(int(w/base[1]), w, int(w/base[1])):
                click_command += "input tap {} {};".format(x, y)
        self.d.shell(click_command)

    def smart(self):
        futile = -1
        back_key = 2
        app_closed = 0
        time.sleep(8)
        start = int(time.time())
        for _ in range(0, 100):
            if os.path.exists("./skip"):
                os.remove("./skip")
                break
            if int(time.time()) - start > 300:  # 300
                break
            if self.d.is_app_crashed(self.p):
                with open("out/"+self.p+"/crash-"+self.stage+"-"+str(int(time.time()))+".txt", "a") as f:
                    f.write(self.d.shell('logcat -d *:E -t \''+datetime.datetime.fromtimestamp(
                        self.t).strftime('%m-%d %H:%M:%S.0')+'\'|base64')+"\n")
                    self.d.shell('input keyevent KEYCODE_BACK')
            if self.d.is_app_hangs(self.p):
                with open("out/"+self.p+"/hang-"+self.stage+"-"+str(int(time.time()))+".txt", "a") as f:
                    f.write(str(int(time.time()))+"\n")
                    self.d.shell('input keyevent KEYCODE_BACK')

            if self.d.frida.is_lost != 0:
                os.system('kill -9 {pid}'.format(pid=os.getpid()))

            self.d.d.shell(
                "am broadcast -n com.research.helper/.SendGPS -e lat 45.4950378 -e lon -73.5779508 -e accurate 0.5 -e alt 5")

            try:
                # print("sleep 10")
                # time.sleep(10)

                if not self.d.is_app_open(self.p):
                    if app_closed >= 3:
                        break
                    app_closed += 1
                    self.d.run_app(self.p, close=False)
                # print("sleep 10.1")
                # time.sleep(10)

                memory_snapshot = len(str(self.memory))
                self.d.wait_if_internet_isnt_available()
                self.d.d.wake()

                root = get_root(self.d)
                print("**---++----")
                for _ in range(0, 10):
                    self.find_input_and_fill(
                        root, obj_class=["android.widget.edittext"])

                for _ in range(0, 10):
                    if finder(root, transform=partial(
                            find_clickable_enable, text="9", obj_class=["android.widget.button"], click=True), count=[1], window_hash=window_hash(root)):
                        root = get_root(self.d)
                    else:
                        break
                windowhash = window_hash(root)

                if not self.d.is_app_open(self.p):
                    if app_closed >= 3:
                        break
                    app_closed += 1
                    self.d.run_app(self.p, close=False)
                    continue

                fct = self.find_and_click_by_text(
                    root, obj_class=["android.widget.checkedtextview", "android.view.view", "android.widget.button", "android.widget.textview", "android.widget.imageview", "android.widget.imagebutton","android.widget.LinearLayout"])
                logging.debug("mem:"+str(self.memory))
                if fct == False:
                    if windowhash == get_root(self.d):
                        self.d.shell('input keyevent KEYCODE_BACK')
                if memory_snapshot == len(str(self.memory)):
                    logging.debug("futile:"+str(futile))
                    if futile >= 4:
                        if back_key <= 0:
                            break
                        futile -= 1
                        self.d.shell('input keyevent KEYCODE_BACK')
                        time.sleep(1)
                        if not self.d.is_app_open(self.p):
                            break
                        back_key -= 1
                    elif futile == 3:
                        self.dumb_interaction()
                    futile += 1
                    time.sleep(abs(futile)/2)
                    logging.debug("xxxxxx")
                else:
                    logging.debug("aaaaaa")
                    back_key = 3
                    futile = 1
            except ValueError as ee:
                logging.debug("xsxs")
                logging.debug(ee)
                self.dumb_interaction()
                if back_key <= 0:
                    break

                self.d.shell('input keyevent KEYCODE_BACK')
                back_key -= 1
            except RuntimeError:
                self.dumb_interaction(deep=True)
                # self.d.shell('input keyevent KEYCODE_BACK')
            # logging.debug(self.memory)
        # time.sleep(20)
        # finder(root, transform=partial(find_button_click, text="Update"))
        # logging.debug(self.d.vc.dump())

    def find_similar_button(self):
        pass

    def dump(self):
        pass
