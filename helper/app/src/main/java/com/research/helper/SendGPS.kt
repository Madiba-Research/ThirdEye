package com.research.helper

import android.content.Intent

import android.content.BroadcastReceiver
import android.content.Context
import android.util.Log
import java.lang.String
import android.location.LocationManager
import android.location.Location
import android.os.Build
import android.os.SystemClock


class SendGPS : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {

        Log.i("research", intent.action.toString())

        var lat =
            if (intent.getStringExtra("lat") != null) intent.getStringExtra("lat")!!
                .toDouble() else "0".toDouble()
        var lon =
            if (intent.getStringExtra("lon") != null) intent.getStringExtra("lon")!!
                .toDouble() else "0".toDouble()
        var alt =
            if (intent.getStringExtra("alt") != null) intent.getStringExtra("alt")!!
                .toDouble() else "0".toDouble()
        var accurate =
            if (intent.getStringExtra("accurate") != null) intent.getStringExtra("accurate")!!
                .toFloat() else "0".toFloat()
        Log.i(
            "logTag",
            String.format(
                "setting mock to Latitude=%f, Longitude=%f Altitude=%f Accuracy=%f",
                lat,
                lon,
                alt,
                accurate
            )
        )

        setLocation(LocationManager.GPS_PROVIDER, context, lat, lon, alt, accurate)
        setLocation(LocationManager.NETWORK_PROVIDER, context, lat, lon, alt, accurate)
//        val intent = Intent(context, HelperService::class.java)
//        context.startForegroundService(intent)

    }


    fun setLocation(
        provider: kotlin.String,
        context: Context,
        lat: Double,
        lon: Double,
        alt: Double,
        accuracy: Float
    ) {
        var lm = context.getSystemService(
            Context.LOCATION_SERVICE
        ) as LocationManager
        lm.addTestProvider(
            provider, false, false, false, false, false,
            true, true, 1, 1
        )
        val mockLocation = Location(provider)
        mockLocation.latitude = lat
        mockLocation.longitude = lon
        mockLocation.altitude = alt
        mockLocation.time = System.currentTimeMillis()
        mockLocation.accuracy = accuracy
        mockLocation.elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
        lm.setTestProviderEnabled(provider, true)
        lm.setTestProviderLocation(provider, mockLocation)
    }
}