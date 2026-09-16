import Demo from './demo'
import { HighlightText } from "@/components/ui/highlight-text";

export default function App() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Demo frontContent={
        <div className="absolute inset-x-0 bottom-24 flex w-full items-center justify-center p-8 z-10 pointer-events-auto">
          <p className="max-w-md text-center text-2xl font-sans font-normal text-white leading-relaxed">
            Build interfaces that feel{" "}
            <HighlightText>effortless</HighlightText> and stay{" "}
            <HighlightText variant="yellow">delightful</HighlightText> for every{" "}
            <HighlightText variant="pink">user</HighlightText>.
          </p>
        </div>
      } />
    </div>
  )
}
