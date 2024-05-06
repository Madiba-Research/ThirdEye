setTimeout(function() {
    Java.perform(function() {
        var MediaMuxer = Java.use("android.media.MediaMuxer");
        var AudioRecord = Java.use("android.media.AudioRecord");
        var MediaProjection = Java.use("android.media.projection.MediaProjection");
        var MediaProjectionManager = Java.use("android.media.projection.MediaProjectionManager");
        var Camera = Java.use("android.hardware.Camera");
        var CameraDevice = Java.use("android.hardware.camera2.CameraDevice");


        Camera.open.overload('int').implementation = function(p0) {
            var ret = this.open(p0);
            send('{"media":"{\\"class_name\\":\\"android.hardware.Camera\\",\\"method_name\\":\\"open\\",\\"args\\":[' + p0 + '],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }

        Camera.open.overload().implementation = function() {
            var ret = this.open();
            send('{"media":"{\\"class_name\\":\\"android.hardware.Camera\\",\\"method_name\\":\\"open\\",\\"args\\":[],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }
        Camera.release.overload().implementation = function() {
            var ret = this.release();
            send('{"media":"{\\"class_name\\":\\"android.hardware.Camera\\",\\"method_name\\":\\"release\\",\\"args\\":[],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }

        CameraDevice.createCaptureRequest.overload('int').implementation = function(p0) {
            var ret = this.createCaptureRequest(p0);
            send('{"media":"{\\"class_name\\":\\"android.hardware.camera2.CameraDevice\\",\\"method_name\\":\\"createCaptureRequest\\",\\"args\\":[' + p0 + '],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }

        CameraDevice.close.overload().implementation = function() {
            var ret = this.close();
            send('{"media":"{\\"class_name\\":\\"android.hardware.camera2.CameraDevice\\",\\"method_name\\":\\"close\\",\\"args\\":[],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }

        CameraDevice.createCaptureRequest.overload('int').implementation = function(p0) {
            var ret = this.createCaptureRequest(p0);
            send('{"media":"{\\"class_name\\":\\"android.hardware.camera2.CameraDevice\\",\\"method_name\\":\\"createCaptureRequest\\",\\"args\\":[' + p0 + '],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }

        MediaMuxer.start.implementation = function() {
            var ret = this.start();
            send('{"media":"{\\"class_name\\":\\"android.media.MediaMuxer\\",\\"method_name\\":\\"start\\",\\"args\\":[],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }

        MediaMuxer.stop.implementation = function() {
            var ret = this.stop();
            send('{"media":"{\\"class_name\\":\\"android.media.MediaMuxer\\",\\"method_name\\":\\"stop\\",\\"args\\":[],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }

        MediaProjection.stop.implementation = function() {
            var ret = this.stop();
            send('{"media":"{\\"class_name\\":\\"android.media.projection.MediaProjection\\",\\"method_name\\":\\"stop\\",\\"args\\":[],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }

        MediaProjectionManager.createScreenCaptureIntent.implementation = function() {
            var ret = this.createScreenCaptureIntent();
            send('{"media":"{\\"class_name\\":\\"android.media.projection.MediaProjectionManager\\",\\"method_name\\":\\"createScreenCaptureIntent\\",\\"args\\":[],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }
        AudioRecord.startRecording.overload().implementation = function() {
            var ret = this.startRecording();
            send('{"media":"{\\"class_name\\":\\"android.media.AudioRecord\\",\\"method_name\\":\\"startRecording\\",\\"args\\":[],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }
        AudioRecord.stop.overload().implementation = function() {
            var ret = this.stop();
            send('{"media":"{\\"class_name\\":\\"android.media.AudioRecord\\",\\"method_name\\":\\"stop\\",\\"args\\":[],\\"ret\\":\\"\\",\\"stackTrace\\":\\"' + btoa(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())) + '\\"}"}');
            return ret;
        }
    });
}, 0);