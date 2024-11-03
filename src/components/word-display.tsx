"use client";

import {
	generateGradientColors,
	getContrastColor,
	getRandomItem,
	seededRandom,
} from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getRandomWord } from "./actions";
import fonts from "./font-list";

interface WordState {
	word: string;
	gradientColors: [string, string, number];
	fontFamily: string;
	textColor: string;
	rotation: number;
	isVisible: boolean;
}

interface WordDisplayProps {
	initialWord?: string;
}

export default function WordDisplay({ initialWord }: WordDisplayProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Initial word state with fallback options for word and style properties
	const [wordState, setWordState] = useState<WordState>({
		word: initialWord || searchParams.get("word") || "",
		gradientColors: ["#000", "#000", 0],
		fontFamily: "",
		textColor: "black",
		rotation: 0,
		isVisible: true,
	});

	const [isRefreshing, setIsRefreshing] = useState(false);

	// Function to update styles based on the new word
	const updateStyles = useCallback((word: string) => {
		// Generate gradient colors based on the word
		const gradientColors = generateGradientColors(word);

		// Get a random font for the word, replacing "+" with a space
		const fontFamily = getRandomItem(fonts, word).replace("+", " ");

		// Temporarily set background to extract gradient color and calculate contrast
		const tempElement = document.createElement("div");
		tempElement.style.background = `linear-gradient(${gradientColors[2]}deg, ${gradientColors[0]}, ${gradientColors[1]})`;
		document.body.appendChild(tempElement);
		const bgColor = window
			.getComputedStyle(tempElement)
			.getPropertyValue("background-color");
		document.body.removeChild(tempElement);

		// Determine text color for readability and set random rotation
		const textColor = getContrastColor(bgColor);
		const rotation = seededRandom(`${word}rotation`) * 10 - 5; // Rotate between -5 and 5 degrees

		// Dynamically load font from Google Fonts
		const link = document.createElement("link");
		link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(" ", "+")}&display=swap`;
		link.rel = "stylesheet";
		document.head.appendChild(link);

		// Update word state with new styles
		setWordState((prev) => ({
			...prev,
			gradientColors,
			fontFamily,
			textColor,
			rotation,
		}));
	}, []);

	// Function to fetch a new random word and update the URL parameter
	const fetchNewWord = useCallback(async () => {
		const newWord = await getRandomWord();
		router.push(`/?word=${encodeURIComponent(newWord)}`, { scroll: false });
		setWordState((prev) => ({
			...prev,
			word: newWord,
			isVisible: true,
			textColor: "rgba(0,0,0,0)", // Temporary transparent text for transition effect
		}));
		updateStyles(newWord);
	}, [router, updateStyles]);

	// Handle word refresh with transition
	const handleRefresh = useCallback(() => {
		if (isRefreshing) return;
		setIsRefreshing(true);
		setWordState((prev) => ({ ...prev, isVisible: false })); // Fade out effect
	}, [isRefreshing]);

	// Initial word setup or update based on current state
	useEffect(() => {
		if (!wordState.word) {
			fetchNewWord();
		} else {
			updateStyles(wordState.word);
		}
	}, [wordState.word, fetchNewWord, updateStyles]);

	// Handle transition effects during word refresh
	useEffect(() => {
		if (!wordState.isVisible && isRefreshing) {
			const timeoutId = setTimeout(() => {
				fetchNewWord();
				setIsRefreshing(false);
			}, 500);

			return () => clearTimeout(timeoutId);
		}
	}, [wordState.isVisible, isRefreshing, fetchNewWord]);

	return (
		<div
			className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
			style={{
				background: `linear-gradient(${wordState.gradientColors[2]}deg, ${wordState.gradientColors[0]}, ${wordState.gradientColors[1]})`,
				transition: "background 0.5s ease-in-out",
			}}
		>
			<h1
				className={`text-center p-4 leading-none transition-all duration-500 overflow-hidden text-clip flex items-center justify-center w-full h-full ${
					wordState.isVisible ? "opacity-100" : "opacity-0"
				}`}
				style={{
					fontFamily: wordState.fontFamily,
					color: wordState.textColor,
					fontSize: "clamp(5vw, 10vw + 10vh, 20vw)", // Scale font size dynamically with a max limit
					transform: `rotate(${wordState.rotation}deg)`,
					transition:
						"color 0.5s ease-in-out, opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
				}}
			>
				{wordState.word}
			</h1>
			<div
				className="absolute bottom-8 left-8 text-sm transition-opacity duration-500"
				style={{
					color: wordState.textColor,
					fontFamily: wordState.fontFamily,
					opacity: wordState.isVisible ? 1 : 0,
				}}
			>
				Font: {wordState.fontFamily.replace("+", " ")}{" "}
				{/* Display font name with spaces */}
			</div>
			<button
				onClick={handleRefresh}
				className="absolute bottom-8 right-8 p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
				disabled={isRefreshing}
				aria-label="Get new random word"
				type="button"
			>
				<RefreshCw
					className={`w-6 h-6 text-gray-800 ${isRefreshing ? "animate-spin" : ""}`}
				/>
			</button>
		</div>
	);
}
