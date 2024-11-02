'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { getRandomWord } from '../app/actions'

const fonts = [
  'Roboto', 'Open+Sans', 'Lato', 'Montserrat', 'Raleway', 'Poppins', 'Playfair+Display', 'Merriweather', 'Nunito', 'Quicksand',
  'Oswald', 'Source+Sans+Pro', 'Rubik', 'PT+Sans', 'Noto+Sans', 'Ubuntu', 'Dosis', 'Titillium+Web', 'Fira+Sans', 'Crimson+Text',
  'Work+Sans', 'Karla', 'Josefin+Sans', 'Libre+Baskerville', 'Arvo', 'Cabin', 'Bitter', 'Fjalla+One', 'Inconsolata', 'Archivo+Narrow',
  'Muli', 'Abril+Fatface', 'Varela+Round', 'Exo+2', 'Comfortaa', 'Alegreya', 'Barlow', 'Cormorant+Garamond', 'Dancing+Script',
  'EB+Garamond', 'Fira+Code', 'Heebo', 'IBM+Plex+Sans', 'Jost', 'Kalam', 'Lobster', 'Manrope', 'Nanum+Gothic', 'Overpass',
  'Pacifico', 'Questrial', 'Righteous', 'Spectral', 'Teko', 'Ubuntu+Mono', 'Vollkorn', 'Yanone+Kaffeesatz', 'Zilla+Slab',
  'Amatic+SC', 'Bebas+Neue', 'Caveat', 'DM+Sans', 'Encode+Sans', 'Fredoka+One', 'Great+Vibes', 'Hind', 'Inter', 'Josefin+Slab',
  'Kanit', 'Libre+Franklin', 'Maven+Pro', 'Noto+Serif', 'Oxygen', 'Permanent+Marker', 'Quattrocento+Sans', 'Roboto+Condensed',
  'Shadows+Into+Light', 'Tajawal', 'Urbanist', 'Viga', 'Wendy+One', 'Xanh+Mono', 'Yellowtail', 'Zen+Kaku+Gothic+New',
  'Abhaya+Libre', 'Bai+Jamjuree', 'Cardo', 'Domine', 'Exo', 'Faustina', 'Glegoo', 'Hind+Siliguri', 'Istok+Web', 'Jura',
  'Khand', 'Lemonada', 'Martel', 'Nanum+Myeongjo', 'Orbitron', 'Philosopher', 'Quantico', 'Rokkitt', 'Saira', 'Tinos'
]

interface WordState {
  word: string
  gradientColors: [string, string, number]
  fontFamily: string
  textColor: string
  fontSize: number
  rotation: number
  isVisible: boolean
}

function seededRandom(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  const x = Math.sin(hash) * 10000
  return x - Math.floor(x)
}

function generateGradientColors(seed: string): [string, string, number] {
  const randomColor = (salt: string) => {
    const r = Math.floor(seededRandom(seed + salt + 'r') * 256)
    const g = Math.floor(seededRandom(seed + salt + 'g') * 256)
    const b = Math.floor(seededRandom(seed + salt + 'b') * 256)
    return `rgb(${r}, ${g}, ${b})`
  }
  const angle = Math.floor(seededRandom(seed + 'angle') * 360)
  return [randomColor('color1'), randomColor('color2'), angle]
}

const getContrastColor = (bgColor: string): string => {
  const rgb = bgColor.match(/\d+/g)!.map(Number)
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255
  return luminance > 0.5 ? 'black' : 'white'
}

const getRandomItem = <T,>(items: T[], seed: string): T => {
  const index = Math.floor(seededRandom(seed) * items.length)
  return items[index]
}

export default function WordDisplay() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [wordState, setWordState] = useState<WordState>({
    word: searchParams.get('word') || '',
    gradientColors: ['#000', '#000', 0],
    fontFamily: '',
    textColor: 'black',
    fontSize: 20,
    rotation: 0,
    isVisible: true
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const wordRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateStyles = useCallback((word: string) => {
    const gradientColors = generateGradientColors(word)
    const fontFamily = getRandomItem(fonts, word).replace('+', ' ')

    const tempElement = document.createElement('div')
    tempElement.style.background = `linear-gradient(${gradientColors[2]}deg, ${gradientColors[0]}, ${gradientColors[1]})`
    document.body.appendChild(tempElement)
    const bgColor = window.getComputedStyle(tempElement).getPropertyValue('background-color')
    document.body.removeChild(tempElement)

    const textColor = getContrastColor(bgColor)
    const rotation = seededRandom(word + 'rotation') * 10 - 5 // Rotate between -5 and 5 degrees

    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    setWordState(prev => ({
      ...prev,
      gradientColors,
      fontFamily,
      textColor,
      rotation
    }))
  }, [])

  const fetchNewWord = useCallback(async () => {
    const newWord = await getRandomWord()
    router.push(`/?word=${encodeURIComponent(newWord)}`)
    setWordState(prev => ({ ...prev, word: newWord, isVisible: true, textColor: 'rgba(0,0,0,0)' }))
    updateStyles(newWord)
  }, [router, updateStyles])

  const handleRefresh = useCallback(() => {
    if (isRefreshing) return
    setIsRefreshing(true)
    setWordState(prev => ({ ...prev, isVisible: false }))
  }, [isRefreshing])

  useEffect(() => {
    if (!wordState.word) {
      fetchNewWord()
    } else {
      updateStyles(wordState.word)
    }
  }, [wordState.word, fetchNewWord, updateStyles])

  useEffect(() => {
    if (!wordState.isVisible && isRefreshing) {
      const timeoutId = setTimeout(async () => {
        await fetchNewWord()
        setIsRefreshing(false)
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [wordState.isVisible, isRefreshing, fetchNewWord])

  useEffect(() => {
    const adjustFontSize = () => {
      if (wordRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const containerHeight = containerRef.current.offsetHeight
        let fontSize = 100 // Start with a reasonable size

        wordRef.current.style.fontSize = `${fontSize}px`

        while (
          (wordRef.current.offsetWidth < containerWidth * 0.9 && wordRef.current.offsetHeight < containerHeight * 0.9) &&
          fontSize < 1000
        ) {
          fontSize += 5
          wordRef.current.style.fontSize = `${fontSize}px`
        }

        while (
          (wordRef.current.offsetWidth > containerWidth * 0.9 || wordRef.current.offsetHeight > containerHeight * 0.9) &&
          fontSize > 1
        ) {
          fontSize -= 1
          wordRef.current.style.fontSize = `${fontSize}px`
        }

        setWordState(prev => ({ ...prev, fontSize }))
      }
    }

    adjustFontSize()
    window.addEventListener('resize', adjustFontSize)
    return () => window.removeEventListener('resize', adjustFontSize)
  }, [wordState.word, wordState.fontFamily])

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(${wordState.gradientColors[2]}deg, ${wordState.gradientColors[0]}, ${wordState.gradientColors[1]})`,
        transition: 'background 0.5s ease-in-out',
      }}
    >
      <h1
        ref={wordRef}
        className={`text-center p-4 leading-none transition-all duration-500 ${wordState.isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          fontFamily: wordState.fontFamily,
          color: wordState.textColor,
          fontSize: `${wordState.fontSize}px`,
          transform: `rotate(${wordState.rotation}deg)`,
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.5s ease-in-out, opacity 0.5s ease-in-out, transform 0.5s ease-in-out'
        }}
      >
        {wordState.word}
      </h1>
      <div
        className="absolute bottom-8 left-8 text-sm transition-opacity duration-500"
        style={{
          color: wordState.textColor,
          fontFamily: wordState.fontFamily,
          opacity: wordState.isVisible ? 1 : 0
        }}
      >
        Font: {wordState.fontFamily}
      </div>
      <button
        onClick={handleRefresh}
        className="absolute bottom-8 right-8 p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
        disabled={isRefreshing}
        aria-label="Get new random word"
      >
        <RefreshCw className={`w-6 h-6 text-gray-800 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )
}
