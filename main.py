import device
import functools
import sys
import exceptions
import hooker
import time
import static
import dynamic
import logging
import os
import shutil

# logging.debug(list(substring in "aaass" for substring in ['java/security', 'javax/crypto/spec']))

root = logging.getLogger()
root.setLevel(logging.DEBUG)

ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.DEBUG)
FORMAT = "[%(asctime)s - %(filename)s:%(lineno)s - %(funcName)s() ] %(message)s"
formatter = logging.Formatter(FORMAT)
ch.setFormatter(formatter)
root.addHandler(ch)


def main():
    logging.debug("value")
    try:
        devices = device.get_active_devices()
    except:
        _, value, _ = sys.exc_info()
        logging.debug(value)
        sys.exit(1)
    else:
        cdevice = None
        # print(devices)
        for d in devices:
            if d.d.serialno == "10.42.0.27:5555":
                # continue
                cdevice = d
                break
            cdevice = d
    print(cdevice.d.serialno)
    cdevice.close_all_apps()
#        cdevice = devices[0]

    with open("packages.txt", "r") as packages:
        for _i, pkg_name in enumerate(packages.read().splitlines()):
            # if i < 20:
            #     continue
            # pkg_name = "com.trtf.blue"
            
            if (not os.path.exists("out/" + pkg_name+"/"+pkg_name + ".pcap") or not os.path.exists("out/" + pkg_name + "/mitmdump")):
                if os.path.exists("out/" + pkg_name+"/"):
                    for f in os.listdir("out/" + pkg_name+"/"):
                        if f.endswith('.png') or f.endswith('.txt') or f.endswith('.lock'):
                            os.remove("out/" + pkg_name+"/"+f)
                    if os.path.exists("out/" + pkg_name + "/mitmdump"):
                        os.remove("out/" + pkg_name + "/mitmdump")
                    if os.path.exists("out/" + pkg_name + "/files-1"):
                        shutil.rmtree("out/" + pkg_name + "/files-1")
                    if os.path.exists("out/" + pkg_name + "/files-2"):
                        shutil.rmtree("out/" + pkg_name + "/files-2")
                    if os.path.exists("out/" + pkg_name+"/"+pkg_name + ".pcap"):
                        os.remove("out/" + pkg_name+"/"+pkg_name + ".pcap")
                elif os.path.exists("out/" + pkg_name+".fail"):
                    continue
            else:
                continue
            cdevice.uninstall_3rd_party_apps()
            #pkg_name = "com.apple.movetoios"
            logging.debug(pkg_name)
            if cdevice.install_app(pkg_name, reinstall=False) == False:
                continue
            cdevice.store_app(pkg_name)
            # static_analysis = None
            static_analysis = static.Package(pkg_name)
            perms, service_name = cdevice.grant_app_permissions(pkg_name)
            (p, mitm) = cdevice.start_capture(pkg_name)
            h = dynamic.Dynamic(cdevice, pkg_name, static_analysis)
            h.run()
            analysis_time = int(time.time())
            with open("out/"+pkg_name+"/time.txt", "a") as f:
                f.write("s1+:"+str(analysis_time)+"\n")
            cdevice.run_app(pkg_name)
            cdevice.start_interaction(pkg_name, 1, analysis_time)
            cdevice.close_app(pkg_name)
            with open("out/"+pkg_name+"/time.txt", "a") as f:
                f.write("s1-:"+str(int(time.time()))+"\n")
            cdevice.store_files(pkg_name, 1)
            if os.path.exists("out/"+pkg_name+"/crypt-1.txt") and 1==2:
                logging.debug("======> "+pkg_name+" 2nd")
                open("out/"+pkg_name+"/2nd.lock", 'a').close()
                if cdevice.install_app(pkg_name, reinstall=True) == False:
                    raise "Unable to install"
                cdevice.grant_app_permissions(
                    pkg_name, perms=perms, service_name=service_name)
                analysis_time = int(time.time())
                with open("out/"+pkg_name+"/time.txt", "a") as f:
                    f.write("s2+:"+str(analysis_time)+"\n")
                cdevice.run_app(pkg_name)
                cdevice.start_interaction(pkg_name, 2, analysis_time)
                cdevice.close_app(pkg_name)
                with open("out/"+pkg_name+"/time.txt", "a") as f:
                    f.write("s2-:"+str(int(time.time()))+"\n")
                cdevice.store_files(pkg_name, 2)
                os.remove("out/"+pkg_name+"/2nd.lock")
            h.stop()
            cdevice.stop_capture(p, mitm, pkg_name)
            cdevice.uninstall_app(pkg_name)
            # break
            # package = static.Package(pkg_name)
            # # native_methods = package.get_methods(lambda m: (
            # #     m.get_access_flags() & 0x100) == 0x100)  # 0x100 means native
            # # native_methods = package.get_methods(
            # #     lambda m: (m.get_name() in ("encrypt", "decrypt") or any(substring in m.get_descriptor().decode("utf-8") for substring in ['java/security', 'javax/crypto/spec'])))
            # native_methods = package.get_methods(
            #     lambda m: (m.get_name() in ("encrypt", "decrypt") or m.get_name().decode("utf-8").startswith("hash")))
            # jscode = "Java.perform(function () {"+("".join((m.to_frida(p).decode("utf-8")
            #                                                 for m in native_methods)))+"});"
            # logging.debug(jscode)
            # with open("js/bypass_root_detection.js") as f:
            #     jscode += f.read()
            # # logging.debug(cdevice.is_alive())
            # cdevice.frida.on("spawn-added", functools.partial(hooker.spawn_added,
            #                                                   package=pkg_name, jscode=jscode, frida_device=cdevice.frida, processes=dict()))
            # cdevice.frida.enable_spawn_gating()
            # logging.debug("x")
            # sys.stdin.read()


if __name__ == '__main__':
    main()

# for i in `find . -name "*.pcap" -type f`; do
#    python ../pcap-full.py "$i"
# done
