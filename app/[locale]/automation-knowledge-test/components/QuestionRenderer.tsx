import { Question } from '../types';
import YesNoQuestion from './YesNoQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import TextQuestion from './TextQuestion';
import CodeQuestion from './CodeQuestion';

interface QuestionRendererProps {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
}

export default function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  switch (question.type) {
    case 'yes_no':
      return (
        <YesNoQuestion
          question={question}
          selectedAnswer={answer}
          onAnswerSelect={onAnswerChange}
        />
      );

    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          selectedAnswer={answer}
          onAnswerSelect={onAnswerChange}
        />
      );

    case 'text':
      return (
        <TextQuestion
          question={question}
          answer={answer || ''}
          onAnswerChange={onAnswerChange}
        />
      );

    case 'code':
      return (
        <CodeQuestion
          question={question}
          answer={answer || { language: question.languages[0].id, code: '' }}
          onAnswerChange={onAnswerChange}
        />
      );

    default:
      return <div className="text-red-500">Unknown question type</div>;
  }
}
