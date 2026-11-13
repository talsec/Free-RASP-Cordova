package app.talsec.rasp.cordova.events

internal interface BaseRaspEvent {
    val value: Int
    val channelName: String
    val channelKey: String
}
