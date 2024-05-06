var JavaConnectionPool = {};
var Modules = {};
const Files = new Map();


function base64(input) {
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    return output;
}


function btoa(p) {
    if (p == null) {
        return ''
    } else {
        if (typeof (p) === 'string') {
            var p = Java.use('java.lang.String').$new(p).getBytes();
        }
        try {
            if (p.$className == "java.nio.HeapByteBuffer") {
                p = p.array();
            }
            var Base64 = Java.use('android.util.Base64');
            var base64encode = Base64.encodeToString.overload('[B', 'int');
            return base64encode.call(Base64, p, 2);
        } catch (_e) {
            return arrayBufferToBase64(p);
        }
    }
}

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return base64(binary);

}
function ntohs(val) {
    return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
}

function inet_pton(a) {
    let m
    let i
    let j
    const f = String.fromCharCode

    m = a.match(/^(?:\d{1,3}(?:\.|$)){4}/)
    if (m) {
        m = m[0].split('.')
        m = f(m[0], m[1], m[2], m[3])
        // Return if 4 bytes, otherwise false.
        if (m.length === 4) {
            var ret = new Uint8Array(4);
            for (var ii = 0; ii < m.length; ii++) {
                ret[ii] = m.charCodeAt(ii);
            }
            return ret;
        } else {
            return false;
        }
        // return m.length === 4 ? new Uint8Array(m.split("")
        //     .map(c => c.charCodeAt(0).toString(16).padStart(2, "0"))) : false
    }

    // IPv6
    if (a.length > 39) {
        return false
    }

    m = a.split('::')

    if (m.length > 2) {
        return false
    } // :: can't be used more than once in IPv6.

    const reHexDigits = /^[\da-f]{1,4}$/i

    for (j = 0; j < m.length; j++) {
        if (m[j].length === 0) { // Skip if empty.
            continue
        }
        m[j] = m[j].split(':')
        for (i = 0; i < m[j].length; i++) {
            let hextet = m[j][i]
            if (!reHexDigits.test(hextet)) {
                return false
            }

            hextet = parseInt(hextet, 16)
            if (isNaN(hextet)) {
                return false
            }
            m[j][i] = f(hextet >> 8, hextet & 0xFF)
        }
        m[j] = m[j].join('')
    }
    var final = m.join('\x00'.repeat(16 - m.reduce((tl, m) => tl + m.length, 0)));

    var ret = new Uint8Array(16);
    for (var ii = 0; ii < final.length; ii++) {
        ret[ii] = final.charCodeAt(ii);
    }
    return ret;

}
function arrayBuffer(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return (binary);

}
function inet_ntop(v) { //https://github.com/locutusjs/locutus/blob/master/src/php/network/inet_ntop.js
    var a = arrayBuffer(v);
    let i = 0
    let m = ''
    const c = []
    a += ''
    if (a.length === 4) {
        return [a.charCodeAt(0), a.charCodeAt(1), a.charCodeAt(2), a.charCodeAt(3)].join('.')
    } else if (a.length === 16) {
        for (i = 0; i < 16; i++) {
            c.push(((a.charCodeAt(i++) << 8) + a.charCodeAt(i)).toString(16))
        }
        return c.join(':').replace(/((^|:)0(?=:|$))+:?/g, function (t) {
            m = (t.length > m.length) ? t : m
            return t
        }).replace(m || ' ', '::')
    } else {
        return null
    }
}
function ipv4t6(a) {
    var z = inet_pton(a)
    if (z == false) {
        return false
    }
    var ar = new Uint8Array(16);
    for (var i = 0; i < 4; i++) {
        ar[12 + i] = z[i];
    }
    return inet_ntop(ar);
}

var proxy_addr4 = "10.42.0.1"
var proxy_addr6 = ipv4t6(proxy_addr4)

Java.perform(function () {
    try {
        Java.use('java.lang.System').exit.implementation = function (v) {
            // console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));
            return this.exit(v);
        }
    } catch (_) { }
    try {
        Java.use('android.app.KeyguardManager').isDeviceSecure.overload().implementation = function (v) {
            
            // console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));
            return true;
        }
    } catch (_) { }
    try {
        Java.use("android.app.ApplicationPackageManager").getInstallerPackageName.implementation = function (_packageName) {
            // console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));
            return Java.use("java.lang.String").$new("com.android.vending").toString();;
        }
    } catch (_) { }
    try {
        Java.use('android.content.pm.InstallSourceInfo').getInstallingPackageName.implementation = function () {
            return Java.use("java.lang.String").$new("com.android.vending").toString();
        }
    } catch (_) { }

});

// Process.enumerateModules()
//    .forEach(function (m) {
//        if (m.path.startsWith("/apex/") || m.path.startsWith("/data/app/")) {
//            Memory.protect(m.base, m.size, 'rwx');
//        }
//    });

