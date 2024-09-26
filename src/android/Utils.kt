package com.aheaditec.talsec.cordova

import org.json.JSONArray
import org.json.JSONObject

class Utils {}

internal fun JSONArray.toArray(): Array<String> {
    val output = mutableListOf<String>()
    for (i in 0 until this.length()) {
        this.getString(i)?.let(output::add)
    }
    return output.toTypedArray()
}

internal fun JSONObject.getArraySafe(key: String): Array<String> {
    if (this.has(key)) {
        val inputArray = this.getJSONArray(key)
        return inputArray.toArray()
    }
    return arrayOf()
}

internal fun JSONObject.getBooleanSafe(key: String, defaultValue: Boolean = true): Boolean {
    if (this.has(key)) {
        return this.getBoolean(key)
    }
    return defaultValue
}

internal fun JSONObject.getStringSafe(key: String): String? {
    if (this.has(key)) {
        return this.getString(key)
    }
    return null
}