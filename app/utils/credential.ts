import { AnonCredsCredentialMetadataKey, CredentialExchangeRecord, CredentialState } from '@adeya/ssi'
import { ImageSourcePropType } from 'react-native'

import { Attribute, Field, W3CCredentialAttribute } from '../types/record'

import { luminanceForHexColor } from './luminance'

export const isValidAnonCredsCredential = (credential: CredentialExchangeRecord) => {
  return (
    (credential &&
      credential.state === CredentialState.OfferReceived &&
      credential.credentialAttributes &&
      credential.credentialAttributes?.length > 0) ||
    credential.state === CredentialState.OfferReceived ||
    (Boolean(credential.metadata.get(AnonCredsCredentialMetadataKey)) &&
      credential.credentials.find(c => c.credentialRecordType === 'anoncreds' || c.credentialRecordType === 'w3c'))
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const credentialTextColor = (ColorPallet: any, hex?: string) => {
  const midpoint = 255 / 2
  if ((luminanceForHexColor(hex ?? '') ?? 0) >= midpoint) {
    return ColorPallet.grayscale.darkGrey
  }
  return ColorPallet.grayscale.white
}

export const toImageSource = (source: unknown): ImageSourcePropType => {
  if (typeof source === 'string') {
    return { uri: source as string }
  }
  return source as ImageSourcePropType
}

export const getCredentialIdentifiers = (credential: CredentialExchangeRecord) => {
  return {
    credentialDefinitionId: credential.metadata.get(AnonCredsCredentialMetadataKey)?.credentialDefinitionId,
    schemaId: credential.metadata.get(AnonCredsCredentialMetadataKey)?.schemaId,
  }
}

export const isW3CCredential = (credential: CredentialExchangeRecord) => {
  return (
    credential &&
    credential?.credentials[0].credentialRecordType === 'w3c' &&
    !credential.metadata.get(AnonCredsCredentialMetadataKey)?.credentialDefinitionId &&
    credential?.credentialAttributes?.length === 0
  )
}

export const sanitizeString = (str: string) => {
  if (!str) return ''
  let result = str.replace(/_/g, ' ')
  result = result.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  let words = result.split(/\s+/).filter(word => word.length > 0)
  words = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
  return words.join(' ')
}

export function getHostNameFromUrl(url: string) {
  //TODO: Find more elegant way to extract host name
  // const urlRegex = /^(.*:)\/\/([A-Za-z0-9-.]+)(:[0-9]+)?(.*)$/
  // const parts = urlRegex.exec(url)
  // return parts ? parts[2] : undefined
  return url.split('https://')[1]
}

export const buildFieldsFromOpenIDTemplate = (data: {
  [key: string]: unknown
}): Array<Field | W3CCredentialAttribute> => {
  const processedObjects = new WeakMap()
  const fields: Array<Field | W3CCredentialAttribute> = []

  const processValue = (key: string, value: unknown, level: number = 0): Field | W3CCredentialAttribute => {
    if (key === 'id' || key === 'type') {
      return null as any
    }

    if (typeof value === 'string' || typeof value === 'number' || value === null || value === undefined) {
      if (level === 0) {
        return new Attribute({ name: key, value: value as string | number | null })
      } else {
        return {
          key: sanitizeString(key),
          value: value !== null && value !== undefined ? String(value) : '',
          level,
          shown: true,
        }
      }
    }

    if (typeof value === 'object' && value !== null) {
      if (processedObjects.has(value)) {
        return {
          key: sanitizeString(key),
          value: '[Circular Reference]',
          level,
          shown: true,
        }
      }

      processedObjects.set(value, true)
      const children: W3CCredentialAttribute[] = []

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return {
            key: sanitizeString(key),
            value: '[]',
            level,
            shown: true,
          }
        }

        if (value.every(item => typeof item !== 'object' || item === null)) {
          return {
            key: sanitizeString(key),
            value: value.join(', '),
            level,
            shown: true,
          }
        }

        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            const itemChildren: W3CCredentialAttribute[] = []
            Object.entries(item).forEach(([itemKey, itemValue]) => {
              if (itemKey !== 'id' && itemKey !== 'type') {
                const processed = processValue(itemKey, itemValue, level + 2) as W3CCredentialAttribute
                if (processed) {
                  itemChildren.push(processed)
                }
              }
            })

            children.push({
              key: `${sanitizeString(key)} ${index + 1}`,
              value: '',
              isExpandable: true,
              isExpanded: level === 0,
              level: level + 1,
              shown: true,
              children: itemChildren,
            })
          } else {
            children.push({
              key: `Item ${index + 1}`,
              value: String(item),
              level: level + 1,
              shown: true,
            })
          }
        })
      } else {
        Object.entries(value).forEach(([objKey, objValue]) => {
          if (objKey !== 'id' && objKey !== 'type') {
            const processed = processValue(objKey, objValue, level + 1) as W3CCredentialAttribute
            if (processed) {
              children.push(processed)
            }
          }
        })
      }

      if (children.length > 0) {
        return {
          key: sanitizeString(key),
          value: '',
          isExpandable: true,
          isExpanded: level === 0,
          children,
          level,
          shown: true,
        }
      }

      return {
        key: sanitizeString(key),
        value: Array.isArray(value) ? '[]' : '{}',
        level,
        shown: true,
      }
    }

    return {
      key: sanitizeString(key),
      value: String(value),
      level,
      shown: true,
    }
  }

  for (const key of Object.keys(data)) {
    if (key === 'id' || key === 'type') continue
    const processed = processValue(key, data[key], 0)
    if (processed) {
      fields.push(processed)
    }
  }

  return fields
}
export const formatCredentialSubject = (subject: any): W3CCredentialAttribute[] => {
  const processedObjects = new WeakMap()
  const attributes: W3CCredentialAttribute[] = []
  const currentSubject = subject?.claims || subject

  const processAttribute = (key: string, value: any, level: number): W3CCredentialAttribute => {
    const sanitizedKey = sanitizeString(key)

    if (typeof value !== 'object' || value === null) {
      return {
        key: sanitizedKey,
        value: value !== null && value !== undefined ? String(value) : '',
        level,
        shown: true,
      }
    }

    if (processedObjects.has(value)) {
      return {
        key: sanitizedKey,
        value: '[Circular Reference]',
        level,
        shown: true,
      }
    }

    processedObjects.set(value, true)

    const children: W3CCredentialAttribute[] = []

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return {
          key: sanitizedKey,
          value: '[]',
          level,
          shown: true,
        }
      } else if (value.every(item => typeof item !== 'object' || item === null)) {
        return {
          key: sanitizedKey,
          value: value.join(', '),
          level,
          shown: true,
        }
      }

      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          const itemNode: W3CCredentialAttribute = {
            key: `${sanitizedKey} ${index + 1}`,
            value: '',
            isExpandable: true,
            isExpanded: level === 0,
            level: level + 1,
            shown: true,
            children: [],
          }

          Object.entries(item).forEach(([itemKey, itemValue]) => {
            if (itemKey !== 'id' && itemKey !== 'type' && itemNode.children) {
              itemNode.children.push(processAttribute(itemKey, itemValue, level + 2))
            }
          })

          children.push(itemNode)
        } else {
          children.push({
            key: `Item ${index + 1}`,
            value: String(item),
            level: level + 1,
            shown: true,
          })
        }
      })
    } else {
      Object.entries(value).forEach(([objKey, objValue]) => {
        if (objKey !== 'id' && objKey !== 'type') {
          children.push(processAttribute(objKey, objValue, level + 1))
        }
      })
    }

    if (children.length > 0) {
      return {
        key: sanitizedKey,
        value: '',
        isExpandable: true,
        isExpanded: level === 0,
        children,
        level,
        shown: true,
      }
    }

    return {
      key: sanitizedKey,
      value: Array.isArray(value) ? '[]' : '{}',
      level,
      shown: true,
    }
  }

  Object.entries(currentSubject).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'type') {
      attributes.push(processAttribute(key, value, 0))
    }
  })

  return attributes
}

export const getCredentialSubject = (data: any): any => {
  if (data?.jsonld?.credential?.credentialSubject) {
    return data.jsonld.credential.credentialSubject
  }

  if (data?.credential?.credentialSubject) {
    return data.credential.credentialSubject
  }

  if (data?.credentialRecord?.credential?.credentialSubject) {
    return data.credentialRecord.credential.credentialSubject
  }

  if (data?.credentialSubject) {
    return data.credentialSubject
  }

  if (typeof data === 'object' && data !== null) {
    for (const key in data) {
      const nestedData = data[key]
      if (nestedData?.credential?.credentialSubject) {
        return nestedData.credential.credentialSubject
      }
      if (nestedData?.credentialSubject) {
        return nestedData.credentialSubject
      }
    }
  }
  return null
}
export const buildFieldsFromJSONLDCredential = (credentialSubject: any): Array<Field> => {
  const result = []
  for (const property in credentialSubject) {
    let encoding
    let format

    if (property === 'image') {
      encoding = 'base64'
      format = 'image/png'
    }
    result.push({
      name: property,
      value: credentialSubject[property],
      encoding: encoding,
      format: format,
    })
  }
  return result.map(attr => new Attribute(attr)) || []
}
