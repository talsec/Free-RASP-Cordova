package com.aheaditec.talsec.cordova.events

internal interface BaseRaspEvent {
    val value: Int
    val channelName: String
    val channelKey: String
}