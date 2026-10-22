/// FolderPlay Infrastructure: Motion Sensor Adapter (Shake-to-Reset)
/// Implements MotionSensorPort using sensors_plus for accelerometer polling
/// Invariant AD-6: Sensor streams only active during countdown

import 'dart:async';
import 'dart:io';
import 'package:sensors_plus/sensors_plus.dart';
import '../../core/domain/port/motion_sensor_port.dart';

class AccelerometerMotionAdapter implements MotionSensorPort {
  final _forceController = StreamController<double>.broadcast();
  StreamSubscription? _subscription;

  double _lastX = 0;
  double _lastY = 0;
  double _lastZ = 0;

  @override
  Stream<double> get accelerationForceStream => _forceController.stream;

  @override
  Future<bool> isSupported() async {
    // Accelerometer is supported on mobile devices (Android / iOS)
    return Platform.isAndroid || Platform.isIOS;
  }

  @override
  void startListening() {
    stopListening();
    if (!Platform.isAndroid && !Platform.isIOS) return;

    _subscription = accelerometerEventStream().listen((event) {
      final deltaX = (event.x - _lastX).abs();
      final deltaY = (event.y - _lastY).abs();
      final deltaZ = (event.z - _lastZ).abs();
      final force = deltaX + deltaY + deltaZ;

      _lastX = event.x;
      _lastY = event.y;
      _lastZ = event.z;

      _forceController.add(force);
    });
  }

  @override
  void stopListening() {
    _subscription?.cancel();
    _subscription = null;
  }
}
