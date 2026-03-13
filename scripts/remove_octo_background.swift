import AppKit
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

func clamp(_ value: Double, min minValue: Double = 0.0, max maxValue: Double = 1.0) -> Double {
  Swift.max(minValue, Swift.min(maxValue, value))
}

func smoothstep(edge0: Double, edge1: Double, x: Double) -> Double {
  let t = clamp((x - edge0) / (edge1 - edge0))
  return t * t * (3.0 - 2.0 * t)
}

guard CommandLine.arguments.count >= 3 else {
  fputs("Usage: swift remove_octo_background.swift <input> <output>\n", stderr)
  exit(1)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])

guard
  let source = CGImageSourceCreateWithURL(inputURL as CFURL, nil),
  let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
else {
  fputs("Failed to load input image.\n", stderr)
  exit(1)
}

let width = image.width
let height = image.height
let bytesPerPixel = 4
let bytesPerRow = bytesPerPixel * width
let bitsPerComponent = 8

guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) else {
  fputs("Failed to create color space.\n", stderr)
  exit(1)
}

var pixels = [UInt8](repeating: 0, count: Int(height * bytesPerRow))

guard let context = CGContext(
  data: &pixels,
  width: width,
  height: height,
  bitsPerComponent: bitsPerComponent,
  bytesPerRow: bytesPerRow,
  space: colorSpace,
  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
) else {
  fputs("Failed to create bitmap context.\n", stderr)
  exit(1)
}

context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))

for index in stride(from: 0, to: pixels.count, by: 4) {
  let r = Double(pixels[index]) / 255.0
  let g = Double(pixels[index + 1]) / 255.0
  let b = Double(pixels[index + 2]) / 255.0

  let maxChannel = max(r, g, b)
  let minChannel = min(r, g, b)
  let chroma = maxChannel - minChannel
  let luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  let pinkSignal = max(0.0, r - b) + max(0.0, r - g)

  let darknessMask = 1.0 - smoothstep(edge0: 0.07, edge1: 0.24, x: luminance)
  let lowSaturationMask = 1.0 - smoothstep(edge0: 0.08, edge1: 0.26, x: chroma)
  let retainSignal = smoothstep(edge0: 0.08, edge1: 0.28, x: pinkSignal + chroma * 0.7)

  let removeStrength = clamp(darknessMask * (0.78 + lowSaturationMask * 0.32) - retainSignal * 0.72)
  let outputAlpha = clamp(1.0 - removeStrength)

  pixels[index + 3] = UInt8(outputAlpha * 255.0)
}

guard let outputImage = context.makeImage() else {
  fputs("Failed to create output image.\n", stderr)
  exit(1)
}

guard let destination = CGImageDestinationCreateWithURL(
  outputURL as CFURL,
  UTType.png.identifier as CFString,
  1,
  nil
) else {
  fputs("Failed to create PNG destination.\n", stderr)
  exit(1)
}

CGImageDestinationAddImage(destination, outputImage, nil)

guard CGImageDestinationFinalize(destination) else {
  fputs("Failed to write output PNG.\n", stderr)
  exit(1)
}

print(outputURL.path)
