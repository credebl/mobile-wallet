import { StyleSheet } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { SvgProps } from 'react-native-svg'

import Arrow from './assets/icons/large-arrow.svg'
import HistoryCardAcceptedIcon from './assets/img/HistoryCardAcceptedIcon.svg'
import HistoryNewConnectionIcon from './assets/img/HistoryNewConnectionIcon.svg'
import HistoryProofRequestIcon from './assets/img/HistoryProofRequestIcon.svg'
import IconChevronRight from './assets/img/IconChevronRight.svg'
import ExploreIconActive from './assets/img/active-explore-icon.svg'
import AppLockout from './assets/img/app-lockout.svg'
import BackupSuccess from './assets/img/backup-success.svg'
import Biometrics from './assets/img/biometrics.svg'
import ContactBook from './assets/img/contact-book.svg'
import CredentialDeclined from './assets/img/credential-declined.svg'
import DeleteNotification from './assets/img/delete-notification.svg'
import EmptyWallet from './assets/img/empty-wallet.svg'
import ExploreIcon from './assets/img/explore-icon.svg'
import IconInfoSentDark from './assets/img/icon-info-sent-dark.svg'
import IconProofRequestDark from './assets/img/icon-proof-request-dark.svg'
import Logo from './assets/img/logo-with-text.svg'
import ProofRequestDeclined from './assets/img/proof-declined.svg'

export interface ISVGAssets {
  appLockout: React.FC<SvgProps>
  biometrics: React.FC<SvgProps>
  contactBook: React.FC<SvgProps>
  credentialDeclined: React.FC<SvgProps>
  deleteNotification: React.FC<SvgProps>
  emptyWallet: React.FC<SvgProps>
  logo: React.FC<SvgProps>
  proofRequestDeclined: React.FC<SvgProps>
  arrow: React.FC<SvgProps>
  BackupSuccess: React.FC<SvgProps>
  iconProofRequestDark: React.FC<SvgProps>
  IconInfoSentDark: React.FC<SvgProps>
  ExploreIcon: React.FC<SvgProps>
  ExploreIconActive: React.FC<SvgProps>
  historyCardAcceptedIcon: React.FC<SvgProps>
  historyProofRequestIcon: React.FC<SvgProps>
  historyNewConnectionIcon: React.FC<SvgProps>
  iconChevronRight: React.FC<SvgProps>
}

export interface IFontAttributes {
  fontFamily?: string
  fontStyle?: 'normal' | 'italic'
  fontSize: number
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  color: string
}

export interface IInputAttributes {
  padding?: number
  borderRadius?: number
  fontSize?: number
  backgroundColor?: string
  color?: string
  borderWidth?: number
  borderColor?: string
}

export interface IInputs {
  label: IFontAttributes
  textInput: IInputAttributes
  inputSelected: IInputAttributes
  singleSelect: IInputAttributes
  singleSelectText: IFontAttributes
  singleSelectIcon: IInputAttributes
  checkBoxColor: IInputAttributes
  checkBoxText: IFontAttributes
}

export interface ITextTheme {
  headingOne: IFontAttributes
  headingTwo: IFontAttributes
  headingThree: IFontAttributes
  headingFour: IFontAttributes
  normal: IFontAttributes
  label: IFontAttributes
  labelTitle: IFontAttributes
  labelSubtitle: IFontAttributes
  labelText: IFontAttributes
  caption: IFontAttributes
  title: IFontAttributes
  headerTitle: IFontAttributes
  modalNormal: IFontAttributes
  modalTitle: IFontAttributes
  popupModalText: IFontAttributes
  modalHeadingOne: IFontAttributes
  modalHeadingThree: IFontAttributes
}

export interface IBrandColors {
  primary: string
  primaryDisabled: string
  secondary: string
  labelText: string
  secondaryDisabled: string
  primaryLight: string
  highlight: string
  primaryBackground: string
  secondaryBackground: string
  modalPrimary: string
  modalSecondary: string
  modalPrimaryBackground: string
  modalSecondaryBackground: string
  modalIcon: string
  link: string
  text: string
  icon: string
  headerText: string
  headerIcon: string
  buttonText: string
  tabBarInactive: string
  unorderedList: string
  unorderedListModal: string
  modalOrgBackground: string
  highlightedEclipse: string
  tabsearchBackground: string
}

export interface ISemanticColors {
  error: string
  success: string
  focus: string
}

export interface INotificationColors {
  success: string
  successBorder: string
  successIcon: string
  successText: string
  info: string
  infoBorder: string
  infoIcon: string
  infoText: string
  warn: string
  warnBorder: string
  warnIcon: string
  warnText: string
  error: string
  errorBorder: string
  errorIcon: string
  errorText: string
  popupOverlay: string
}

export interface IGrayscaleColors {
  black: string
  darkGrey: string
  mediumGrey: string
  lightGrey: string
  veryLightGrey: string
  white: string
}

export interface IColorPallet {
  brand: IBrandColors
  semantic: ISemanticColors
  notification: INotificationColors
  grayscale: IGrayscaleColors
}

export interface IAssets {
  svg: ISVGAssets
  img: {
    logoPrimary: any
    logoSecondary: any
  }
}

export const borderRadius = 4
export const heavyOpacity = 0.7
export const mediumOpacity = 0.5
export const lightOpacity = 0.35
export const zeroOpacity = 0.0
export const borderWidth = 2

const SemanticColors: ISemanticColors = {
  error: '#D8292F',
  success: '#2E8540',
  focus: '#3399FF',
}

const NotificationColors: INotificationColors = {
  success: '#DFF0D8',
  successBorder: '#D6E9C6',
  successIcon: '#2D4821',
  successText: '#2D4821',
  info: '#FFFF',
  infoBorder: '#234CB4',
  infoIcon: '#244CB4',
  infoText: '#1F4EAD',
  warn: '#F9F1C6',
  warnBorder: '#FAEBCC',
  warnIcon: '#6C4A00',
  warnText: '#6C4A00',
  error: '#F2DEDE',
  errorBorder: '#EBCCD1',
  errorIcon: '#A12622',
  errorText: '#A12622',
  popupOverlay: `rgba(0, 0, 0, ${mediumOpacity})`,
}

const GrayscaleColors: IGrayscaleColors = {
  black: '#000000',
  darkGrey: '#313132',
  mediumGrey: '#606060',
  lightGrey: '#D3D3D3',
  veryLightGrey: '#F2F2F2',
  white: '#FFFFFF',
}

const BrandColors: IBrandColors = {
  primary: '#1F4EAD',
  primaryDisabled: `rgba(31, 78, 173, ${lightOpacity})`,
  secondary: '#FFFFFFFF',
  labelText: '#7C7C7C',
  // tabbackground:'#D3E4FA',
  secondaryDisabled: `rgba(31, 78, 173, ${lightOpacity})`,
  primaryLight: '#D9EAF7',
  highlight: '#FCBA19',
  primaryBackground: '#F2F2F2',
  secondaryBackground: '#FFFF',
  modalPrimary: '#003366',
  modalSecondary: '#FFFFFFFF',
  modalPrimaryBackground: '#FFFFFF',
  modalSecondaryBackground: '#F2F2F2',
  modalIcon: GrayscaleColors.darkGrey,
  link: '#1A5A96',
  unorderedList: GrayscaleColors.white,
  unorderedListModal: GrayscaleColors.darkGrey,
  text: GrayscaleColors.white,
  icon: GrayscaleColors.white,
  headerIcon: GrayscaleColors.white,
  headerText: GrayscaleColors.white,
  buttonText: GrayscaleColors.white,
  tabBarInactive: GrayscaleColors.white,
  modalOrgBackground: '#E1EAFF',
  highlightedEclipse: '#012048',
  tabsearchBackground: '#F4F4F4',
}
export const ColorPallet: IColorPallet = {
  brand: BrandColors,
  semantic: SemanticColors,
  notification: NotificationColors,
  grayscale: GrayscaleColors,
}

export const TextTheme: ITextTheme = {
  headingOne: {
    fontSize: 38,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.darkGrey,
  },
  headingTwo: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#2289F7',
  },
  headingThree: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ColorPallet.brand.primary,
  },
  headingFour: {
    fontSize: 21,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.darkGrey,
  },
  normal: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1F4EAD',
    // color: ColorPallet.grayscale.darkGrey,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94A0AB',
  },
  labelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.darkGrey,
  },
  labelSubtitle: {
    fontSize: 14,
    fontWeight: 'normal',
    color: ColorPallet.grayscale.darkGrey,
  },
  labelText: {
    fontSize: 10,
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: ColorPallet.grayscale.darkGrey,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    color: ColorPallet.grayscale.darkGrey,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ColorPallet.notification.infoText,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ColorPallet.brand.headerText,
  },
  modalNormal: {
    fontSize: 18,
    fontWeight: 'normal',
    color: ColorPallet.grayscale.darkGrey,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.darkGrey,
  },
  modalHeadingOne: {
    fontSize: 38,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.darkGrey,
  },
  modalHeadingThree: {
    fontSize: 26,
    fontWeight: 'bold',
    color: ColorPallet.grayscale.darkGrey,
  },
  popupModalText: {
    fontSize: 18,
    fontWeight: 'normal',
    color: ColorPallet.grayscale.darkGrey,
  },
}

export const Inputs: IInputs = StyleSheet.create({
  label: {
    ...TextTheme.label,
  },
  textInput: {
    padding: 10,
    borderRadius,
    fontFamily: TextTheme.normal.fontFamily,
    fontSize: 16,
    backgroundColor: ColorPallet.brand.primaryBackground,
    color: ColorPallet.notification.infoText,
    borderWidth: 2,
    borderColor: ColorPallet.brand.primary,
  },
  inputSelected: {
    borderColor: ColorPallet.brand.primary,
  },
  singleSelect: {
    padding: 12,
    borderRadius: borderRadius * 2,
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  singleSelectText: {
    ...TextTheme.normal,
  },
  singleSelectIcon: {
    color: ColorPallet.brand.text,
  },
  checkBoxColor: {
    color: ColorPallet.brand.primary,
  },
  checkBoxText: {
    ...TextTheme.normal,
  },
})

export const Buttons = StyleSheet.create({
  critical: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: '#D8292F',
  },
  primary: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: ColorPallet.brand.primary,
    textAlign: 'center',
  },
  primaryDisabled: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: ColorPallet.brand.primaryDisabled,
  },
  primaryText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.brand.text,
    textAlign: 'center',
  },
  primaryTextDisabled: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.brand.text,
    textAlign: 'center',
  },
  secondary: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ColorPallet.brand.primary,
  },
  secondaryDisabled: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ColorPallet.brand.secondaryDisabled,
  },
  secondaryText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.brand.primary,
    textAlign: 'center',
  },
  secondaryTextDisabled: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.brand.secondaryDisabled,
    textAlign: 'center',
  },
  modalCritical: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: '#D8292F',
  },
  modalPrimary: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: ColorPallet.brand.primary,
  },
  modalPrimaryText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    textAlign: 'center',
    color: ColorPallet.brand.text,
  },
  modalSecondary: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ColorPallet.brand.primary,
  },
  modalSecondaryText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.brand.primary,
    textAlign: 'center',
  },
})

export const ListItems = StyleSheet.create({
  credentialBackground: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  credentialTitle: {
    ...TextTheme.headingFour,
  },
  credentialDetails: {
    ...TextTheme.caption,
  },
  credentialOfferBackground: {
    backgroundColor: ColorPallet.brand.modalPrimaryBackground,
  },
  credentialOfferTitle: {
    ...TextTheme.modalHeadingThree,
  },
  credentialOfferDetails: {
    ...TextTheme.normal,
  },
  revoked: {
    backgroundColor: ColorPallet.notification.error,
    borderColor: ColorPallet.notification.errorBorder,
  },
  contactBackground: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  credentialIconColor: {
    color: ColorPallet.notification.infoText,
  },
  contactTitle: {
    fontFamily: TextTheme.title.fontFamily,
    color: ColorPallet.grayscale.darkGrey,
  },
  contactDate: {
    fontFamily: TextTheme.normal.fontFamily,
    color: ColorPallet.grayscale.darkGrey,
    marginTop: 10,
  },
  contactIconBackground: {
    backgroundColor: ColorPallet.brand.primary,
  },
  contactIcon: {
    color: ColorPallet.brand.text,
  },
  recordAttributeLabel: {
    ...TextTheme.normal,
  },
  recordContainer: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  recordBorder: {
    borderBottomColor: ColorPallet.brand.primaryBackground,
  },
  recordLink: {
    color: ColorPallet.brand.link,
  },
  recordAttributeText: {
    ...TextTheme.normal,
  },
  proofIcon: {
    ...TextTheme.headingOne,
  },
  proofError: {
    color: ColorPallet.semantic.error,
  },
  proofListItem: {
    paddingHorizontal: 25,
    paddingTop: 16,
    backgroundColor: ColorPallet.brand.primaryBackground,
    borderTopColor: ColorPallet.brand.secondaryBackground,
    borderBottomColor: ColorPallet.brand.secondaryBackground,
    borderTopWidth: 2,
    borderBottomWidth: 2,
  },
  avatarText: {
    ...TextTheme.headingTwo,
    fontWeight: 'normal',
  },
  avatarCircle: {
    borderRadius: TextTheme.headingTwo.fontSize,
    borderColor: TextTheme.headingTwo.color,
    width: TextTheme.headingTwo.fontSize * 2,
    height: TextTheme.headingTwo.fontSize * 2,
  },
  emptyList: {
    ...TextTheme.normal,
  },
  requestTemplateBackground: {
    backgroundColor: ColorPallet.grayscale.white,
  },
  requestTemplateIconColor: {
    color: ColorPallet.notification.infoText,
  },
  requestTemplateTitle: {
    color: ColorPallet.grayscale.black,
    fontWeight: 'bold',
  },
  requestTemplateDetails: {
    color: ColorPallet.grayscale.black,
    fontWeight: 'normal',
  },
  requestTemplateZkpLabel: {
    color: ColorPallet.grayscale.mediumGrey,
  },
  requestTemplateIcon: {
    color: ColorPallet.grayscale.black,
  },
  requestTemplateDate: {
    color: ColorPallet.grayscale.mediumGrey,
  },
})

export const TabTheme = {
  tabBarStyle: {
    height: 60,
    backgroundColor: '#D3E4FA',
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    shadowColor: ColorPallet.grayscale.black,
    shadowOpacity: 0.1,
    borderTopWidth: 0,
    paddingBottom: 0,
  },
  tabBarContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarActiveTintColor: ColorPallet.brand.primary,
  tabBarInactiveTintColor: ColorPallet.notification.infoText,
  tabBarTextStyle: {
    ...TextTheme.label,
    fontWeight: 'normal',
    paddingBottom: 5,
  },
  tabBarButtonIconStyle: {
    color: ColorPallet.grayscale.white,
  },
  focusTabIconStyle: {
    height: 60,
    width: 60,
    backgroundColor: ColorPallet.brand.primary,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusTabActiveTintColor: {
    backgroundColor: ColorPallet.brand.secondary,
  },
}

export const NavigationTheme = {
  dark: true,
  colors: {
    primary: ColorPallet.brand.primary,
    background: ColorPallet.brand.primaryBackground,
    card: ColorPallet.brand.primary,
    text: ColorPallet.brand.text,
    border: ColorPallet.grayscale.white,
    notification: ColorPallet.grayscale.white,
  },
}

export const HomeTheme = StyleSheet.create({
  welcomeHeader: {
    ...TextTheme.headingOne,
  },
  credentialMsg: {
    ...TextTheme.normal,
  },
  notificationsHeader: {
    ...TextTheme.headingThree,
  },
  noNewUpdatesText: {
    ...TextTheme.normal,
    color: ColorPallet.brand.primary,
  },
  link: {
    ...TextTheme.normal,
    color: ColorPallet.brand.link,
  },
})

export const SettingsTheme = {
  groupHeader: {
    ...TextTheme.normal,
    marginBottom: 8,
  },
  groupBackground: ColorPallet.brand.secondaryBackground,
  iconColor: ColorPallet.grayscale.white,
  text: {
    ...TextTheme.caption,
    color: ColorPallet.grayscale.darkGrey,
  },
}

export const ChatTheme = {
  containerStyle: {
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    alignSelf: 'flex-end',
  },
  leftBubble: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
    borderRadius: 4,
    padding: 16,
    marginLeft: 16,
  },
  rightBubble: {
    backgroundColor: ColorPallet.brand.primaryLight,
    borderRadius: 4,
    padding: 16,
    marginRight: 16,
  },
  timeStyleLeft: {
    color: ColorPallet.grayscale.black,
    fontSize: 12,
    marginTop: 8,
  },
  timeStyleRight: {
    color: ColorPallet.grayscale.black,
    fontSize: 12,
    marginTop: 8,
  },
  leftText: {
    color: ColorPallet.grayscale.black,
    fontSize: TextTheme.normal.fontSize,
  },
  leftTextHighlighted: {
    color: ColorPallet.grayscale.black,
    fontSize: TextTheme.normal.fontSize,
    fontWeight: 'bold',
  },
  rightText: {
    color: ColorPallet.grayscale.black,
    fontSize: TextTheme.normal.fontSize,
  },
  rightTextHighlighted: {
    color: ColorPallet.grayscale.black,
    fontSize: TextTheme.normal.fontSize,
    fontWeight: 'bold',
  },
  inputToolbar: {
    backgroundColor: ColorPallet.brand.secondary,
    shadowColor: ColorPallet.brand.primaryDisabled,
    borderRadius: 10,
  },
  inputText: {
    lineHeight: undefined,
    fontWeight: '500',
    fontSize: TextTheme.normal.fontSize,
    color: ColorPallet.brand.primary,
  },
  placeholderText: ColorPallet.grayscale.lightGrey,
  sendContainer: {
    marginBottom: 4,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  sendEnabled: ColorPallet.brand.primary,
  sendDisabled: ColorPallet.brand.primaryDisabled,
  options: ColorPallet.brand.primary,
  optionsText: ColorPallet.grayscale.black,
  openButtonStyle: {
    borderRadius: 32,
    backgroundColor: ColorPallet.brand.primary,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    marginTop: 16,
  },
  openButtonTextStyle: {
    color: ColorPallet.brand.secondary,
    fontSize: TextTheme.normal.fontSize,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  documentIconContainer: {
    backgroundColor: ColorPallet.brand.primary,
    alignSelf: 'flex-start',
    padding: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  documentIcon: {
    color: ColorPallet.grayscale.white,
  },
}

export const OnboardingTheme = {
  container: {
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  carouselContainer: {
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  pagerDot: {
    borderColor: ColorPallet.brand.primary,
  },
  pagerDotActive: {
    color: ColorPallet.brand.primary,
  },
  pagerDotInactive: {
    color: ColorPallet.brand.secondary,
  },
  pagerNavigationButton: {
    color: ColorPallet.brand.primary,
  },
  headerTintColor: ColorPallet.grayscale.white,
  headerText: {
    ...TextTheme.headingTwo,
    color: '#1F4EAD',
  },
  bodyText: {
    ...TextTheme.normal,
    color: ColorPallet.notification.infoText,
  },
  imageDisplayOptions: {
    fill: ColorPallet.notification.infoText,
  },
}

export const DialogTheme = {
  modalView: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  titleText: {
    color: ColorPallet.grayscale.white,
  },
  description: {
    color: ColorPallet.grayscale.white,
  },
  closeButtonIcon: {
    color: ColorPallet.grayscale.white,
  },
  carouselButtonText: {
    color: ColorPallet.grayscale.white,
  },
}

const LoadingTheme = {
  backgroundColor: ColorPallet.brand.secondary,
}

const PINInputTheme = {
  cell: {
    backgroundColor: ColorPallet.grayscale.white,
  },
  focussedCell: {
    borderColor: '#3399FF',
  },
  cellText: {
    color: ColorPallet.grayscale.darkGrey,
  },
  icon: {
    color: '#94A0AB',
  },
}
// export const Assets: IAssets = {
//   ...BifoldImageAssets,
//   svg: {
//     ...BifoldImageAssets.svg,
//     logo: Logo as React.FC,
//   },
//   img: {
//     logoSecondary: {
//       src: require('./assets/img/adeya-logo-secondary.png'),
//       height: hp('7%'),
//       width: wp('36%'),
//       resizeMode: 'contain',
//     },
//     logoPrimary: {
//       src: require('./assets/img/adeyaWhiteLogo.png'),
//       height: hp('7%'),
//       width: wp('36%'),
//       resizeMode: 'contain',
//     },
//   },
// }
export const Assets = {
  svg: {
    appLockout: AppLockout,
    biometrics: Biometrics,
    credentialDeclined: CredentialDeclined,
    deleteNotification: DeleteNotification,
    emptyWallet: EmptyWallet,
    contactBook: ContactBook,
    logo: Logo,
    proofRequestDeclined: ProofRequestDeclined,
    arrow: Arrow,
    BackupSuccess: BackupSuccess,
    iconProofRequestDark: IconProofRequestDark,
    IconInfoSentDark: IconInfoSentDark,
    ExploreIcon: ExploreIcon,
    ExploreIconActive: ExploreIconActive,
    historyCardAcceptedIcon: HistoryCardAcceptedIcon,
    historyProofRequestIcon: HistoryProofRequestIcon,
    historyNewConnectionIcon: HistoryNewConnectionIcon,
    iconChevronRight: IconChevronRight,
  },
  img: {
    logoPrimary: {
      src: require('./assets/img/adeyaWhiteLogo.png'),
      aspectRatio: 1,
      height: hp('7%'),
      width: wp('36%'),
      resizeMode: 'contain',
    },
    logoSecondary: {
      src: require('./assets/img/adeya-logo-secondary.png'),
      aspectRatio: 1,
      height: hp('7%'),
      width: wp('36%'),
      resizeMode: 'contain',
    },
  },
}

export interface ITheme {
  ColorPallet: IColorPallet
  TextTheme: ITextTheme
  Inputs: IInputs
  Buttons: any
  ListItems: any
  TabTheme: any
  NavigationTheme: any
  HomeTheme: any
  SettingsTheme: any
  ChatTheme: any
  OnboardingTheme: any
  DialogTheme: any
  LoadingTheme: any
  PINInputTheme: any
  heavyOpacity: any
  borderRadius: any
  borderWidth: typeof borderWidth
  Assets: IAssets
}

export const theme: ITheme = {
  ColorPallet,
  TextTheme,
  Inputs,
  Buttons,
  ListItems,
  TabTheme,
  NavigationTheme,
  HomeTheme,
  SettingsTheme,
  ChatTheme,
  OnboardingTheme,
  DialogTheme,
  LoadingTheme,
  PINInputTheme,
  heavyOpacity,
  borderRadius,
  borderWidth,
  Assets,
}
