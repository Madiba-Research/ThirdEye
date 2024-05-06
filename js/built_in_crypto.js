setTimeout(function () {

    Java.perform(function () {
        // try {
        var cipher = Java.use('javax.crypto.Cipher');
        cipher.doFinal.overload().implementation = function () {
            var ret = this.doFinal();
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"doFinal\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[],\\"ret\\":\\"' + btoa(ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };
        
        cipher.doFinal.overload('[B').implementation = function (p0) {
            var ret = this.doFinal(p0);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"doFinal\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[\\"' + btoa(p0) + '\\"],\\"ret\\":\\"' + btoa(ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };
        
        cipher.doFinal.overload('java.nio.ByteBuffer', 'java.nio.ByteBuffer').implementation = function (p0, p1) {
            var ret = this.doFinal(p0, p1);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"doFinal\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + btoa(p1) + '\\"],\\"ret\\":\\"' + (ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };
        
        cipher.doFinal.overload('[B', 'int').implementation = function (p0, p1) {
            var ret = this.doFinal(p0, p1);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"doFinal\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + (p1) + '\\"],\\"ret\\":\\"' + (ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };

        cipher.doFinal.overload('[B', 'int', 'int').implementation = function (p0, p1, p2) {
            var ret = this.doFinal(p0, p1, p2);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"doFinal\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + (p1) + '\\",\\"' + (p2) + '\\"],\\"ret\\":\\"' + btoa(ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };

        cipher.doFinal.overload('[B', 'int', 'int', '[B').implementation = function (p0, p1, p2, p3) {
            var ret = this.doFinal(p0, p1, p2, p3);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"doFinal\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + (p1) + '\\",\\"' + (p2) + '\\",\\"' + btoa(p3) + '\\"],\\"ret\\":\\"' + (ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };

        cipher.doFinal.overload('[B', 'int', 'int', '[B', 'int').implementation = function (p0, p1, p2, p3, p4) {
            var ret = this.doFinal(p0, p1, p2, p3, p4);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"doFinal\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + (p1) + '\\",\\"' + (p2) + '\\",\\"' + btoa(p3) + '\\",\\"' + (p4) + '\\"],\\"ret\\":\\"' + (ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };


        cipher.update.overload('[B').implementation = function (p0) {
            var ret = this.update(p0);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"update\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[\\"' + btoa(p0) + '\\"],\\"ret\\":\\"' + btoa(ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };
        
        cipher.update.overload('[B', 'int', 'int').implementation = function (p0, p1, p2) {
            var ret = this.update(p0, p1, p2);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"update\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + (p1) + '\\",\\"' + (p2) + '\\"],\\"ret\\":\\"' + btoa(ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };

        cipher.update.overload('[B', 'int', 'int', '[B').implementation = function (p0, p1, p2, p3) {
            var ret = this.update(p0, p1, p2, p3);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"update\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + (p1) + '\\",\\"' + (p2) + '\\",\\"' + btoa(p3) + '\\"],\\"ret\\":\\"' + (ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };

        cipher.update.overload('[B', 'int', 'int', '[B', 'int').implementation = function (p0, p1, p2, p3, p4) {
            var ret = this.update(p0, p1, p2, p3, p4);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"update\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + (p1) + '\\",\\"' + (p2) + '\\",\\"' + btoa(p3) + '\\",\\"' + (p4) + '\\"],\\"ret\\":\\"' + (ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };


        cipher.update.overload('java.nio.ByteBuffer', 'java.nio.ByteBuffer').implementation = function (p0, p1) {
            var ret = this.update(p0, p1);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"update\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + btoa(p1) + '\\"],\\"ret\\":\\"' + (ret) + '\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        };


        /////////


        cipher.init.overload('int', 'java.security.Key').implementation = function (p0, p1) {
            this.init(p0, p1);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"init-key\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"algorithm\\":\\"' + this.getAlgorithm() + '\\",\\"IV\\":\\"' + btoa(this.getIV()) + '\\",\\"args\\":[\\"' + p0 + '\\",\\"' + btoa(p1.getEncoded()) + '\\"],\\"ret\\":\\"\\"}"}');
        };

        cipher.init.overload('int', 'java.security.cert.Certificate').implementation = function (p0, p1) {
            this.init(p0, p1);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"init-cert\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"algorithm\\":\\"' + this.getAlgorithm() + '\\",\\"IV\\":\\"' + btoa(this.getIV()) + '\\",\\"args\\":[\\"' + p0 + '\\",\\"' + btoa(p1.getEncoded()) + '\\"],\\"ret\\":\\"\\"}"}');
        };
        cipher.init.overload('int', 'java.security.Key', 'java.security.AlgorithmParameters').implementation = function (p0, p1, p2) {
            this.init(p0, p1, p2);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"init-key\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"algorithm\\":\\"' + this.getAlgorithm() + '\\",\\"IV\\":\\"' + btoa(this.getIV()) + '\\",\\"args\\":[\\"' + p0 + '\\",\\"' + btoa(p1.getEncoded()) + '\\",\\"' + p2.getEncoded().getAlgorithm() + '\\"],\\"ret\\":\\"\\"}"}');
        };
        cipher.init.overload('int', 'java.security.Key', 'java.security.SecureRandom').implementation = function (p0, p1, p2) {
            this.init(p0, p1, p2);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"init-key\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"algorithm\\":\\"' + this.getAlgorithm() + '\\",\\"IV\\":\\"' + btoa(this.getIV()) + '\\",\\"args\\":[\\"' + p0 + '\\",\\"' + btoa(p1.getEncoded()) + '\\",\\"' + "java.security.SecureRandom" + '\\"],\\"ret\\":\\"\\"}"}');
        };

        cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function (p0, p1, p2) {
            this.init(p0, p1, p2);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"init-key\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"algorithm\\":\\"' + this.getAlgorithm() + '\\",\\"IV\\":\\"' + btoa(this.getIV()) + '\\",\\"args\\":[\\"' + p0 + '\\",\\"' + btoa(p1.getEncoded()) + '\\",\\"' + "java.security.spec.AlgorithmParameterSpec" + '\\"],\\"ret\\":\\"\\"}"}');
        };

        cipher.init.overload('int', 'java.security.cert.Certificate', 'java.security.SecureRandom').implementation = function (p0, p1, p2) {
            this.init(p0, p1, p2);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"init-cert\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"algorithm\\":\\"' + this.getAlgorithm() + '\\",\\"IV\\":\\"' + btoa(this.getIV()) + '\\",\\"args\\":[\\"' + p0 + '\\",\\"' + btoa(p1.getEncoded()) + '\\",\\"' + "java.security.SecureRandom" + '\\"],\\"ret\\":\\"\\"}"}');
        };

        cipher.init.overload('int', 'java.security.Key', 'java.security.AlgorithmParameters', 'java.security.SecureRandom').implementation = function (p0, p1, p2, p3) {
            this.init(p0, p1, p2, p3);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"init-key\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"algorithm\\":\\"' + this.getAlgorithm() + '\\",\\"IV\\":\\"' + btoa(this.getIV()) + '\\",\\"args\\":[\\"' + p0 + '\\",\\"' + btoa(p1.getEncoded()) + '\\",\\"' + "java.security.AlgorithmParameters" + '\\",\\"' + "java.security.SecureRandom" + '\\"],\\"ret\\":\\"\\"}"}');
        };

        cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec', 'java.security.SecureRandom').implementation = function (p0, p1, p2, p3) {
            this.init(p0, p1, p2, p3);
            send('{"crypto":"{\\"class_name\\":\\"javax.crypto.Cipher\\",\\"method_name\\":\\"init-key\\",\\"hashcode\\":\\"' + this.hashCode() + '\\",\\"algorithm\\":\\"' + this.getAlgorithm() + '\\",\\"IV\\":\\"' + btoa(this.getIV()) + '\\",\\"args\\":[\\"' + p0 + '\\",\\"' + btoa(p1.getEncoded()) + '\\",\\"' + "java.security.spec.AlgorithmParameterSpec" + '\\",\\"' + "java.security.SecureRandom" + '\\"],\\"ret\\":\\"\\"}"}');
        };

        /////
        var IvParameterSpec = Java.use('javax.crypto.spec.IvParameterSpec');
        IvParameterSpec.$init.overload('[B').implementation = function (p0) {
            var ret = this.$init(p0);
            send('{"key-iv":"{\\"class_name\\":\\"javax.crypto.spec.IvParameterSpec\\",\\"method_name\\":\\"$new\\",\\"args\\":[\\"' + btoa(p0) + '\\"],\\"ret\\":\\"\\"}"}');
            return ret;
        };
        var IvParameterSpec = Java.use('javax.crypto.spec.IvParameterSpec');
        IvParameterSpec.$init.overload('[B', 'int', 'int').implementation = function (p0, p1, p2) {
            var ret = this.$init(p0, p1, p2);
            send('{"key-iv":"{\\"class_name\\":\\"javax.crypto.spec.IvParameterSpec\\",\\"method_name\\":\\"$new\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + (p1) + '\\",\\"' + (p2) + '\\"],\\"ret\\":\\"\\"}"}');
            return ret;
        };
        var SecretKeySpec = Java.use('javax.crypto.spec.SecretKeySpec');
        SecretKeySpec.$init.overload('[B', 'java.lang.String').implementation = function (p0, p1) {
            var ret = this.$init(p0, p1);
            send('{"key-iv":"{\\"class_name\\":\\"javax.crypto.spec.SecretKeySpec\\",\\"method_name\\":\\"$new\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + (p1) + '\\"],\\"ret\\":\\"\\"}"}');
            return ret;
        };
        var SecretKeySpec = Java.use('javax.crypto.spec.SecretKeySpec');
        SecretKeySpec.$init.overload('[B', 'int', 'int', 'java.lang.String').implementation = function (p0, p1, p2, p3) {
            var ret = this.$init(p0, p1, p2, p3);
            send('{"key-iv":"{\\"class_name\\":\\"javax.crypto.spec.SecretKeySpec\\",\\"method_name\\":\\"$new\\",\\"args\\":[\\"' + btoa(p0) + '\\",\\"' + (p1) + '\\",\\"' + (p2) + '\\",\\"' + p3 + '\\"],\\"ret\\":\\"\\"}"}');
            return ret;
        };
    });

}, 0);