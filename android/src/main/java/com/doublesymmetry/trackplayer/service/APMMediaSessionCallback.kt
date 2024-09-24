package com.doublesymmetry.trackplayer.service

import android.os.Bundle
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.MediaLibraryService.MediaLibrarySession
import androidx.media3.session.MediaSession
import androidx.media3.session.SessionCommand
import com.lovegaoshi.kotlinaudio.models.CustomButton

class APMMediaSessionCallback (
    private val customActions: List<CustomButton>
) : MediaLibrarySession.Callback {
    // Configure commands available to the controller in onConnect()
    @OptIn(UnstableApi::class)
    override fun onConnect(
        session: MediaSession,
        controller: MediaSession.ControllerInfo
    ): MediaSession.ConnectionResult {
        var sessionCommands = MediaSession.ConnectionResult.DEFAULT_SESSION_COMMANDS.buildUpon()
        customActions.forEach{
                v -> sessionCommands = sessionCommands.add(SessionCommand(v.sessionCommand, Bundle.EMPTY))
        }
        return MediaSession.ConnectionResult.AcceptedResultBuilder(session)
            .setAvailableSessionCommands(sessionCommands.build())
            .build()
    }
}