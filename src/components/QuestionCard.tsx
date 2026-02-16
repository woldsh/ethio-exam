'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { Question } from '@/types';
import RichTextContent from './RichTextContent';

interface QuestionCardProps {
    question: Question;
    selectedAnswer: number | null;
    onSelectAnswer: (index: number) => void;
    showResult?: boolean;
}

const optionLabels = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
    question,
    selectedAnswer,
    onSelectAnswer,
    showResult = false,
}: QuestionCardProps) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto space-y-10"
        >
            {/* Question Section - Very clean and large fonts */}
            <div className="px-2 py-6">
                <RichTextContent
                    content={question.question}
                    className="text-2xl md:text-3xl text-gray-800 leading-snug font-medium math-content"
                />
            </div>

            {/* Options Section - White cards with subtle borders */}
            <div className="space-y-4">
                {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = showResult && index === question.correctAnswer;
                    const isWrong = showResult && isSelected && index !== question.correctAnswer;

                    let cardStyle = "group relative flex items-center gap-6 p-6 rounded-2xl border transition-all cursor-pointer ";

                    if (showResult) {
                        if (isCorrect) cardStyle += "border-emerald-500 bg-emerald-50/50";
                        else if (isWrong) cardStyle += "border-red-500 bg-red-50/40";
                        else cardStyle += "border-gray-100 bg-white opacity-40";
                    } else {
                        if (isSelected) cardStyle += "border-blue-500 bg-blue-50/30 shadow-sm";
                        else cardStyle += "border-gray-200 bg-white hover:border-blue-400 hover:shadow-sm";
                    }

                    return (
                        <motion.div
                            key={index}
                            whileHover={!showResult ? { x: 4 } : {}}
                            whileTap={!showResult ? { scale: 0.998 } : {}}
                            className={cardStyle}
                            onClick={() => !showResult && onSelectAnswer(index)}
                        >
                            {/* Option Circle */}
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border transition-all shrink-0
                                ${isSelected && !showResult ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-gray-100 border-gray-200 text-gray-500'}
                                ${isCorrect ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : ''}
                                ${isWrong ? 'bg-red-600 border-red-600 text-white shadow-lg' : ''}
                            `}>
                                {optionLabels[index]}
                            </div>

                            {/* Option Text */}
                            <div className="flex-1 min-w-0 overflow-visible">
                                <RichTextContent
                                    content={option}
                                    className={`text-xl md:text-2xl leading-relaxed math-content ${isSelected || isCorrect || isWrong ? 'text-gray-900 font-bold' : 'text-gray-700 font-medium'}`}
                                />
                            </div>

                            {/* Result Icons */}
                            <AnimatePresence>
                                {showResult && isCorrect && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200"
                                    >
                                        <Check className="w-6 h-6 stroke-[3px]" />
                                    </motion.div>
                                )}
                                {showResult && isWrong && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 border border-red-200"
                                    >
                                        <X className="w-6 h-6 stroke-[3px]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Explanation & Result Summary */}
            {showResult && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-10 rounded-[3rem] border-2 shadow-2xl ${selectedAnswer === question.correctAnswer ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}
                >
                    <div className="flex gap-8 items-center">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-lg ${selectedAnswer === question.correctAnswer ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                            {selectedAnswer === question.correctAnswer ? <Check className="w-10 h-10 stroke-[3px]" /> : <X className="w-10 h-10 stroke-[3px]" />}
                        </div>
                        <div className="space-y-1">
                            <h4 className={`text-3xl font-black tracking-tight ${selectedAnswer === question.correctAnswer ? 'text-emerald-900' : 'text-red-900'}`}>
                                {selectedAnswer === question.correctAnswer ? 'Excellent!' : 'Incorrect Choice'}
                            </h4>
                            <p className="text-gray-600 text-xl font-medium">
                                {selectedAnswer === question.correctAnswer
                                    ? 'Your understanding of this mathematical concept is perfect.'
                                    : `The correct path leads to Option ${optionLabels[question.correctAnswer]}.`}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
