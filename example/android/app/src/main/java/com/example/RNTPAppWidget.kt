package com.example

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.widget.RemoteViews
import androidx.annotation.OptIn
import com.doublesymmetry.trackplayer.model.Track
import com.doublesymmetry.trackplayer.service.MusicService

/**
 * Implementation of App Widget functionality.
 */
class RNTPAppWidget : AppWidgetProvider() {

    private lateinit var binder: MusicService.MusicBinder

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        track: Track,
        bitmap: Bitmap?
    ) {
        // Construct the RemoteViews object
        val views = RemoteViews(context.packageName, R.layout.rntp_app_widget)
        views.setTextViewText(R.id.songName, track.title ?: "")
        views.setTextViewText(R.id.artistName, track.artist ?: "")
        if (bitmap != null) {
            views.setImageViewBitmap(R.id.albumArt, bitmap)
        }
        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        if (!::binder.isInitialized || !binder.isBinderAlive) {
            binder = peekService(context, Intent(context, MusicService::class.java)) as MusicService.MusicBinder
            if (!binder.isBinderAlive) return
        }
        val track = binder.service.currentTrack;
        val bitmap = binder.service.currentBitmap[0]
        // There may be multiple widgets active, so update all of them
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId, track, bitmap)
        }
    }

    override fun onEnabled(context: Context) {
        // Enter relevant functionality for when the first widget is created
    }

    override fun onDisabled(context: Context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}
