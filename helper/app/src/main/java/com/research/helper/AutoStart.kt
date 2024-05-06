package com.research.helper


import android.content.Intent

import android.content.BroadcastReceiver
import android.content.Context
import android.util.Log
import java.lang.String
import android.location.LocationManager
import android.location.Location
import android.os.SystemClock


class AutoStart : BroadcastReceiver() {
    override fun onReceive(context: Context, arg1: Intent) {
        var lat = 45.4950378
        var lon = -73.5779508
        var alt = 5.0
        var accurate = 0.5f
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

