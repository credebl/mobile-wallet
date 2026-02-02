import React from 'react'
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface CredentialRowCardProps {
  name: string
  issuer?: string
  onPress?(): void
  bgColor?: string
  bgImage?: string
  txtColor?: string
  issuerLogo?: string
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  background: {
    width: '100%',
    height: 140,
  },
  backgroundImage: {
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 16,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  header: {},
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: { padding: 16 },
  issuerLabel: {
    fontSize: 11,
    opacity: 0.8,
  },
  issuerName: {
    fontSize: 13,
    fontWeight: '500',
  },
})

export function OpenIDCredentialRowCard({
  name,
  bgColor = '#202020',
  bgImage,
  txtColor = '#fff',
  onPress,
  issuerLogo,
}: CredentialRowCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.container, { backgroundColor: bgColor }]}>
      <ImageBackground
        source={bgImage ? { uri: bgImage } : undefined}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.overlay} />

        <View style={styles.content}>
          {issuerLogo ? (
            <Image
              source={{
                uri: issuerLogo,
              }}
              resizeMode="contain"
              width={64}
              height={48}
            />
          ) : null}
          <View style={styles.header}>
            <Text style={[styles.title, { color: txtColor }]} numberOfLines={2}>
              {name}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  )
}
