import os
import re
from zipfile import BadZipFile

from androguard.core.bytecodes.apk import APK
from androguard.core.bytecodes.dvm import DalvikVMFormat


class Package:
    def __init__(self, package, output="out/"):
        self.dexes = set()
        for apk_path in [output+package+'/'+f for f in os.listdir(
                output+package+'/') if re.match(r'.+\.apk', f)]:
            try:
                for dex in APK(apk_path).get_all_dex():
                    try:
                        self.dexes.add(DalvikVMFormat(dex))
                    except:
                        pass
                    # break
            except BadZipFile:
                (os.remove(apk_path) for apk_path in [
                 output+package+'/'+f for f in os.listdir(output+package+'/') if re.match(r'.+\.apk', f)])
                os.system('kill -9 {pid}'.format(pid=os.getpid()))

    def get_methods(self, filter):
        methods = set()
        for dex in self.dexes:
            for method in dex.get_methods():
                if method.get_name().endswith(b"-impl"):
                    continue
                new_method = Method()
                new_method.into(method)
                if method.get_name().decode("utf-8").find(' ') == -1 and method.get_name().decode("utf-8").find('-') == -1 and method.class_name.decode("utf-8").find('$') == -1 and method.get_descriptor().decode("utf-8").find('$') == -1 and not method.class_name.decode("utf-8").endswith("Impl;") and not (method.get_access_flags() & 0x100) == 0x100:
                    if filter(new_method):
                        print(method.class_name)
                        print(method.get_name())
                        methods.add(new_method)
        return methods


class Method:
    def into(self, method):
        self.class_name = (method.get_class_name(
        )[1:].decode("utf-8").rstrip(';').replace('/', '.'))
        self.name = ("$init" if method.get_name().decode("utf-8") ==
                     "<init>" else method.get_name().decode("utf-8"))
        self.params, self.return_type = description_mapper(
            method.get_descriptor())

    def to_jni(self):
        return "Java_"+jni_translation(self.class_name).replace('.', "_")+"_"+jni_translation(self.name)

    def to_frida(self, body=lambda method, body: "", ret=""):
        params = {}
        for i, param in enumerate(self.params):
            params["p"+str(i)] = param
        if ret == "":
            ret = "return this."+self.name + \
                "("+(", ".join([key for key, value in params.items()]))+")"
        return "try{Java.use('"+self.class_name+"')."+self.name+".overload("+("" if len(params) == 0 else "'"+"', '".join([value for key, value in params.items()])+"'")+").implementation  = function ("+", ".join([key for key, value in params.items()])+") {"+body(self, params)+";"+ret+"};} catch(_e) {}"


def jni_translation(_str):
    return _str.replace('_', '_1').replace(';', '_2').replace('[', '_3')


def description_mapper(description):
    types = {
        "V": "void",
        "Z": "boolean",
        "B": "byte",
        "S": "short",
        "C": "char",
        "I": "int",
        "J": "long",
        "F": "float",
        "D": "double",
    }
    description, return_type = description.split(")", 1)
    param_list = list()
    return_type = types[return_type] if return_type in types else "[" + \
        types[return_type[1:]] if return_type[1:] in types else return_type.replace(
            "/", ".")
    ret = return_type if type(return_type) == str else return_type.decode()

    for params in description[1:].split(" "):
        if params in types and params[0] != "[":
            param_list.append((types[params] if type(
                types[params]) == str else types[params].decode()))
        elif len(params) != 0:
            if len(params) != 0 and params[0] == "[":
                param_list.append("["+(params[1:] if type(params[1:])
                                  == str else params[1:].decode()).replace("/", "."))
            else:
                param_list.append((params[1:len(params)-1] if type(params[1:len(
                    params)-1]) == str else params[1:len(params)-1].decode()).replace("/", "."))

    return param_list, ret

# def description_mapper(description):
#     types = {
#         "V": "void",
#         "Z": "boolean",
#         "B": "byte",
#         "S": "short",
#         "C": "char",
#         "I": "int",
#         "J": "long",
#         "F": "float",
#         "D": "double",
#     }
#     description, return_type = description.split(")", 1)
#     param_list = list()
#     return_type = types[return_type] if return_type in types else "[" + \
#         types[return_type[1:]] if return_type[1:] in types else return_type.replace(
#             "/", ".")

#     for params in description[1:].split(" "):
#         if params in types and params[0] != "[":
#             param_list.append(bytes(types[params], encoding='utf8'))
#         elif len(params) != 0:
#             if len(params) != 0 and params[0] == "[":
#                 param_list.append(b"["+params[1:].replace("/", "."))
#             else:
#                 param_list.append(params[1:len(params)-1].replace("/", "."))

#     return param_list, return_type
