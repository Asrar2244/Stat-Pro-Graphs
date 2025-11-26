import { FC, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { makeStyles, tokens, Textarea } from '@fluentui/react-components';
import { OutputRenderContext } from '../context';
import { outputUpdateResult } from '@backend';

const useStyles = makeStyles({
  notepadContainer: {
    width: '100%',
    minHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    background: tokens.colorNeutralBackground1,
    boxSizing: 'border-box',
  },
  notepadTextarea: {
    width: '100%',
    minHeight: '80vh',
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    padding: '16px',
    background: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '4px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
});

export const SampleSizeOutput: FC = () => {
  const classes = useStyles();
  const context = useContext(OutputRenderContext);
  const result = context?.selectedRun?.result as any;
  const outputId = context?.selectedRun?.id;
  const dbName = context?.selectedRun?.tabName;
  
  const [reportText, setReportText] = useState('');
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (result && result.report_text) {
      setReportText(result.report_text);
    }
  }, [result]);

  // Debounced save function
  const saveToDatabase = useCallback(async (text: string) => {
    if (!outputId || !dbName) {
      console.warn('Cannot save: missing outputId or dbName');
      return;
    }

    try {
      // Update the result object with the new report text
      const updatedResult = {
        ...result,
        report_text: text,
      };

      // Save to database
      await outputUpdateResult(dbName, [JSON.stringify(updatedResult), outputId]);
      console.log('Sample size report saved to database');
    } catch (error) {
      console.error('Failed to save sample size report:', error);
    }
  }, [outputId, dbName, result]);

  // Handle text change with debouncing
  const handleTextChange = useCallback((newText: string) => {
    setReportText(newText);

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new timer to save after 1 second of no typing
    saveTimerRef.current = setTimeout(() => {
      saveToDatabase(newText);
    }, 1000);
  }, [saveToDatabase]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={classes.notepadContainer}>
      <Textarea
        className={classes.notepadTextarea}
        value={reportText}
        onChange={(_, data) => handleTextChange(data.value)}
        placeholder="Sample size report will appear here..."
        resize="vertical"
      />
    </div>
  );
};

