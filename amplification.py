import os
import json
import dpkt
import socket
import pickle
from multiprocessing.pool import ThreadPool

def amplification_ratio(info):
    pkg, addr, port, data = info
    res_len = 0
    _d = bytes()
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        d_len = len(data)
        _sent = sock.sendto(data, (addr, port))
        sock.settimeout(10)
        while True:
            r_data, server = sock.recvfrom(10*10000)
            _d += r_data
    except:
        if len(_d)/d_len > 1:
            return (pkg, addr, port, data, _d)

leaks = []
hardcoded_keys = []
all_packets = set()
words_path = []
all_words = []
c = 0
for root, dirnames, filenames in os.walk("./"):
    for filename in filenames:
        if filename.endswith(".pcap"):
            conns_files = []
            local_addrs = set()
            if os.path.exists(root+"/conn-1.txt"):
                conns_file_1 = open(os.path.join(root, "conn-1.txt"), "rb")
                conns_files += conns_file_1.readlines()
                conns_file_1.close()
            if os.path.exists(root+"/conn-2.txt"):
                conns_file_2 = open(os.path.join(root, "conn-2.txt"), "rb")
                conns_files += conns_file_2.readlines()
                conns_file_2.close()

            for conn in conns_files:
                if (b"'udp'" in conn or b"'udp6'" in conn) and (not (b":53'," in conn or b":1900'," in conn or b":443'," in conn or b":123'," in conn or b":0'," in conn or b"'null" in conn)) and (b"local_address': '10.42.0" in conn or b"local_address': '/10.42.0" in conn or b"local_address': '::ffff:10.42.0" in conn):
                    cj = json.loads(
                        conn.decode().strip().replace("'", '"'))
                    local_addr = cj["java"]["local_address"] if "java" in cj else cj["native"]["local_address"]
                    local_addrs.add(local_addr.replace(
                        "::ffff:", "").replace("/", ""))
            if len(local_addrs) == 0:
                continue
            _pcap = open(root+"/"+filename, "rb")
            for _, pkt in dpkt.pcap.Reader(_pcap):
                packet = dpkt.ethernet.Ethernet(pkt)
                if type(packet.data) == dpkt.ip.IP and type(packet.data.data) == dpkt.udp.UDP and len(packet.data.src) == 4:
                    if socket.inet_ntoa(packet.data.src)+":"+str(packet.data.data.sport) in local_addrs and int(packet.data.data.dport) not in (53, 0) and not (packet.data.dst[0] == 255 or packet.data.dst[0] in range(224, 240)):
                        all_packets.add((root, socket.inet_ntoa(packet.data.dst), int(
                            packet.data.data.dport), packet.data.data.data))




amplification_rates = dict()
_ar = list()
with ThreadPool(100) as p:
    _ar += [data for data in (p.map(amplification_ratio, all_packets)) if data]
with ThreadPool(500) as p:
    for (pkg, addr, port, data, rdata) in [data for data in (p.map(amplification_ratio, all_packets)) if data]+_ar:
        pkg_name = pkg.split("/")[-1]
        rate = len(rdata)/len(data)
        if pkg_name in amplification_rates:
            if rate > amplification_rates[pkg_name]:
                amplification_rates[pkg_name] = rate
        else:
            amplification_rates[pkg_name] = rate

with open('amplification_ratio.json', 'w') as outfile:
    json.dump(amplification_rates, outfile, indent=4)
