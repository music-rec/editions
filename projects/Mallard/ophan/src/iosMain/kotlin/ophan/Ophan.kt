package ophan

import com.gu.ophan.FileRecordStore
import com.gu.ophan.Logger
import com.gu.ophan.RecordStore
import kotlin.native.concurrent.freeze

actual object Platform {
    actual fun name(): String = "iOS"
}

fun getThreadSafeOphanApi(
        appVersion: String,
        appOs: String,
        deviceName: String,
        deviceManufacturer: String,
        deviceId: String,
        userId: String,
        logger: Logger,
        recordStorePath: String
        //recordStore: RecordStore
): OphanApi = OphanApi(appVersion, appOs, deviceName, deviceManufacturer, deviceId, userId, logger, /*recordStore*/ FileRecordStore(recordStorePath)).freeze()