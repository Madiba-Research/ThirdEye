package com.research.helper

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
//        val number5 = Intent(baseContext, HelperService::class.java)
//        number5.putExtra("times", 5)
//        startForegroundService(number5)
        finish()
    }
}