import { Alert, Dimensions, Platform } from "react-native"
import * as Clipboard from "expo-clipboard"
import Constants from "expo-constants"
import * as Device from "expo-device"
import * as Haptics from "expo-haptics"
import * as ImagePicker from "expo-image-picker"
import * as Linking from "expo-linking"
import * as Location from "expo-location"
import type {
  BridgeRequest,
  DeviceInfo,
  HapticStyle,
  LocationResult,
  PhotoResult,
} from "../../../shared/bridge"

export type ActionRunnerDeps = {
  /** Chamado quando `native.counter` muda o valor acumulado no host. */
  onCounterChanged: (value: number) => void
}

/**
 * Cria o executor de acoes do protocolo v1.
 *
 * O acumulador de `native.counter` vive no closure: cada host tem o seu,
 * e os testes recebem o valor por `onCounterChanged` sem precisar de React.
 */
export function createActionRunner({ onCounterChanged }: ActionRunnerDeps) {
  let counter = 0

  return async function runAction(request: BridgeRequest): Promise<unknown> {
    switch (request.action) {
      case "device.info": {
        const { width, height } = Dimensions.get("window")
        const info: DeviceInfo = {
          platform: Platform.OS,
          osVersion: Device.osVersion ?? String(Platform.Version),
          model: Device.modelName ?? Device.deviceName ?? "desconhecido",
          appVersion: Constants.expoConfig?.version ?? "1.0.0",
          screenWidth: Math.round(width),
          screenHeight: Math.round(height),
        }

        return info
      }

      case "camera.takePhoto": {
        const permission = await ImagePicker.requestCameraPermissionsAsync()

        if (!permission.granted) {
          throw new Error("Permissao de camera negada")
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: request.payload.quality ?? 0.4,
          base64: true,
        })

        if (result.canceled) {
          return null
        }

        const asset = result.assets[0]

        if (!asset) {
          throw new Error("Camera nao retornou uma imagem")
        }

        const photo: PhotoResult = {
          uri: asset.uri,
          dataUrl: asset.base64
            ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`
            : null,
          width: asset.width,
          height: asset.height,
          fileName: asset.fileName ?? null,
          mimeType: asset.mimeType ?? null,
          bytes: asset.fileSize ?? null,
        }

        return photo
      }

      case "location.current": {
        const permission = await Location.requestForegroundPermissionsAsync()

        if (permission.status !== "granted") {
          throw new Error("Permissao de localizacao negada")
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        const location: LocationResult = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          timestamp: position.timestamp,
          mocked: position.mocked ?? false,
        }

        return location
      }

      case "haptics.impact": {
        const style: HapticStyle = request.payload.style
        const feedback: Record<HapticStyle, Haptics.ImpactFeedbackStyle> = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
        }

        await Haptics.impactAsync(feedback[style])
        return { style }
      }

      case "clipboard.write": {
        await Clipboard.setStringAsync(request.payload.text)
        return { length: request.payload.text.length }
      }

      case "clipboard.read":
        return { text: await Clipboard.getStringAsync() }

      case "native.echo":
        return {
          message: request.payload.message,
          echoedAt: new Date().toISOString(),
        }

      case "native.counter": {
        counter += request.payload.delta
        onCounterChanged(counter)
        return { value: counter }
      }

      case "ui.alert": {
        Alert.alert(request.payload.title, request.payload.message)
        return { shown: true }
      }

      case "link.open": {
        const canOpen = await Linking.canOpenURL(request.payload.url)

        if (!canOpen) {
          throw new Error(`URL nao suportada: ${request.payload.url}`)
        }

        await Linking.openURL(request.payload.url)
        return { opened: true }
      }

      default: {
        const exhaustive: never = request
        throw new Error(`Acao desconhecida: ${String(exhaustive)}`)
      }
    }
  }
}
