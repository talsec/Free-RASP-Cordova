package app.talsec.rasp.cordova.events

import app.talsec.rasp.cordova.utils.RandomGenerator
import org.json.JSONArray

internal sealed class RaspExecutionStateEvent(override val value: Int) : BaseRaspEvent {
    override val channelName: String get() = CHANNEL_NAME
    override val channelKey: String get() = CHANNEL_KEY

    data object FastChecksFinished : RaspExecutionStateEvent(RandomGenerator.next())
    data object CriticalChecksFinished : RaspExecutionStateEvent(RandomGenerator.next())
    data object PostponedChecksFinished : RaspExecutionStateEvent(RandomGenerator.next())

    companion object Companion {
        internal val CHANNEL_NAME = RandomGenerator.next().toString()
        internal val CHANNEL_KEY = RandomGenerator.next().toString()

        internal val ALL_EVENTS = JSONArray(
            listOf(
                FastChecksFinished,
                CriticalChecksFinished,
                PostponedChecksFinished
            ).map { it.value }
        )
    }
}
