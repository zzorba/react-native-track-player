package com.doublesymmetry.trackplayer.service

import android.content.Context
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaLibraryService.MediaLibrarySession

class DummyCallback: MediaLibrarySession.Callback {

}

class DummySession (service: MediaLibraryService, context: Context) {
    private val exoPlayer = ExoPlayer.Builder(context).build()
    val mediaSession = MediaLibrarySession.Builder(service, exoPlayer, DummyCallback() ).build()
}