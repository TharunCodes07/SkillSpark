package expo.modules.facelandmarks

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import android.util.Log
import androidx.exifinterface.media.ExifInterface
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult
import com.google.mediapipe.framework.image.BitmapImageBuilder
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayInputStream
import java.io.File
import java.io.InputStream
import java.net.URL

class FaceLandmarksModule : Module() {
    companion object {
        private const val TAG = "FaceLandmarksModule"
        private const val MODEL_FILENAME = "face_landmarker.task"
    }

    private var faceLandmarker: FaceLandmarker? = null

    override fun definition() = ModuleDefinition {
        Name("FaceLandmarks")

        AsyncFunction("detectFromImageAsync") { uri: String, promise: Promise ->
            try {
                Log.d(TAG, "detectFromImageAsync called with uri: $uri")
                
                ensureInitialized()
                
                val context = appContext.reactContext ?: run {
                    promise.reject("CONTEXT_ERROR", "React context is null", null)
                    return@AsyncFunction
                }

                // Read image bytes from URI
                val imageBytes = readImageBytes(context, uri)
                if (imageBytes == null) {
                    promise.reject("IMAGE_READ_ERROR", "Failed to read image from URI: $uri", null)
                    return@AsyncFunction
                }
                
                // Get EXIF orientation and decode + rotate bitmap
                val orientation = getExifOrientation(imageBytes)
                val originalBitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
                if (originalBitmap == null) {
                    promise.reject("DECODE_ERROR", "Failed to decode image", null)
                    return@AsyncFunction
                }
                
                // Rotate bitmap to upright orientation based on EXIF
                val rotatedBitmap = rotateBitmapIfNeeded(originalBitmap, orientation)
                
                Log.d(TAG, "Image size after rotation: ${rotatedBitmap.width}x${rotatedBitmap.height}")
                
                // Convert to MediaPipe image
                val mpImage = BitmapImageBuilder(rotatedBitmap).build()
                
                // Run face landmarker detection
                val result: FaceLandmarkerResult = faceLandmarker!!.detect(mpImage)
                
                // Build response
                val response = mutableMapOf<String, Any>(
                    "width" to rotatedBitmap.width,
                    "height" to rotatedBitmap.height
                )
                
                if (result.faceLandmarks().isEmpty()) {
                    Log.d(TAG, "No face detected")
                    response["landmarks"] = emptyList<Map<String, Double>>()
                } else {
                    // Get landmarks from first detected face
                    val face = result.faceLandmarks()[0]
                    val landmarks = face.map { landmark ->
                        mapOf(
                            "x" to landmark.x().toDouble(),
                            "y" to landmark.y().toDouble(),
                            "z" to landmark.z().toDouble()
                        )
                    }
                    Log.d(TAG, "Detected ${landmarks.size} landmarks")
                    response["landmarks"] = landmarks
                }
                
                // Clean up bitmaps if rotated
                if (rotatedBitmap !== originalBitmap) {
                    originalBitmap.recycle()
                }
                
                promise.resolve(response)
                
            } catch (e: Exception) {
                Log.e(TAG, "Error in detectFromImageAsync", e)
                promise.reject("DETECTION_ERROR", e.message ?: "Unknown error during face detection", e)
            }
        }
    }

    private fun ensureInitialized() {
        if (faceLandmarker != null) return

        val context = appContext.reactContext ?: throw Exception("React context is null")

        Log.d(TAG, "Initializing FaceLandmarker...")

        // Copy model from assets to internal storage (MediaPipe needs a file path)
        val modelFile = File(context.filesDir, MODEL_FILENAME)
        if (!modelFile.exists()) {
            Log.d(TAG, "Copying model from assets to: ${modelFile.absolutePath}")
            context.assets.open(MODEL_FILENAME).use { input ->
                modelFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }
        }

        val baseOptions = BaseOptions.builder()
            .setModelAssetPath(modelFile.absolutePath)
            .build()

        val options = FaceLandmarker.FaceLandmarkerOptions.builder()
            .setBaseOptions(baseOptions)
            .setRunningMode(RunningMode.IMAGE)
            .setNumFaces(1)
            .setMinFaceDetectionConfidence(0.5f)
            .setMinFacePresenceConfidence(0.5f)
            .setMinTrackingConfidence(0.5f)
            .setOutputFaceBlendshapes(false)
            .setOutputFacialTransformationMatrixes(false)
            .build()

        faceLandmarker = FaceLandmarker.createFromOptions(context, options)
        Log.d(TAG, "FaceLandmarker initialized successfully")
    }

    private fun readImageBytes(context: android.content.Context, uriString: String): ByteArray? {
        return try {
            val inputStream: InputStream? = when {
                uriString.startsWith("file://") -> {
                    val path = uriString.removePrefix("file://")
                    File(path).inputStream()
                }
                uriString.startsWith("/") -> {
                    File(uriString).inputStream()
                }
                uriString.startsWith("content://") -> {
                    context.contentResolver.openInputStream(Uri.parse(uriString))
                }
                uriString.startsWith("http://") || uriString.startsWith("https://") -> {
                    URL(uriString).openStream()
                }
                else -> {
                    // Try as content URI
                    context.contentResolver.openInputStream(Uri.parse(uriString))
                }
            }
            inputStream?.use { it.readBytes() }
        } catch (e: Exception) {
            Log.e(TAG, "Error reading image bytes from $uriString", e)
            null
        }
    }

    private fun getExifOrientation(imageBytes: ByteArray): Int {
        return try {
            val inputStream = ByteArrayInputStream(imageBytes)
            val exif = ExifInterface(inputStream)
            exif.getAttributeInt(
                ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_NORMAL
            )
        } catch (e: Exception) {
            Log.w(TAG, "Could not read EXIF orientation", e)
            ExifInterface.ORIENTATION_NORMAL
        }
    }

    private fun rotateBitmapIfNeeded(bitmap: Bitmap, orientation: Int): Bitmap {
        val matrix = Matrix()
        
        when (orientation) {
            ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
            ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
            ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
            ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.preScale(-1f, 1f)
            ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.preScale(1f, -1f)
            ExifInterface.ORIENTATION_TRANSPOSE -> {
                matrix.postRotate(90f)
                matrix.preScale(-1f, 1f)
            }
            ExifInterface.ORIENTATION_TRANSVERSE -> {
                matrix.postRotate(-90f)
                matrix.preScale(-1f, 1f)
            }
            else -> return bitmap // No rotation needed
        }

        return try {
            val rotated = Bitmap.createBitmap(
                bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true
            )
            Log.d(TAG, "Rotated bitmap from ${bitmap.width}x${bitmap.height} to ${rotated.width}x${rotated.height}")
            rotated
        } catch (e: Exception) {
            Log.e(TAG, "Failed to rotate bitmap", e)
            bitmap
        }
    }
}
