package com.doublesymmetry.trackplayer.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.drawable.BitmapDrawable
import android.net.Uri
import androidx.media3.common.util.BitmapLoader
import androidx.media3.common.util.Util.isBitmapFactorySupportedMimeType
import androidx.media3.common.util.UnstableApi
import coil.ImageLoader
import coil.request.ImageRequest
import com.google.common.util.concurrent.ListenableFuture
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.guava.future
import java.io.IOException
import javax.inject.Inject

// https://github.com/androidx/media/issues/121

@UnstableApi
class CoilBitmapLoader @Inject constructor(private val context: Context) : BitmapLoader {

    private val scope = MainScope()
    private val imageLoader = ImageLoader(context)

    override fun supportsMimeType(mimeType: String): Boolean {
        return isBitmapFactorySupportedMimeType(mimeType)
    }

    override fun decodeBitmap(data: ByteArray): ListenableFuture<Bitmap> {
        val bitmap = BitmapFactory.decodeByteArray(data,  /* offset= */0, data.size)
        return scope.future {
            bitmap ?: throw IOException("Unable to decode bitmap")
        }
    }

    override fun loadBitmap(uri: Uri): ListenableFuture<Bitmap> = scope.future {
        val request = ImageRequest.Builder(context)
            .data(uri)
            .allowHardware(false)
            .build()

        val response = imageLoader.execute(request)
        val bitmap = (response.drawable as? BitmapDrawable)?.bitmap
        bitmap
            ?: throw IOException("Unable to load bitmap: $uri")
    }
}