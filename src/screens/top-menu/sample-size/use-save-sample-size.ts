import { useStartProStore } from '@store/main-store';
import { useShallow } from 'zustand/react/shallow';
import { useNodeActions } from '@hooks';
import { Database } from '@utils';
import { SampleSizeTestType, ISampleSizeResult, ITTestForm, IProportionForm, IPairedTTestForm, IAnovaForm, IChiSquareForm } from './types';

export const useSaveSampleSize = () => {
  const { setBlockUI } = useStartProStore(
    useShallow((state) => ({
      setBlockUI: state.setBlockUI,
    }))
  );
  const { openNewTab } = useNodeActions();

  const formatSampleSizeReport = (
    testTitle: string,
    testType: SampleSizeTestType,
    result: ISampleSizeResult,
    ttestForm: ITTestForm,
    proportionForm: IProportionForm,
    pairedTTestForm: IPairedTTestForm,
    anovaForm: IAnovaForm,
    chiSquareForm: IChiSquareForm
  ): string => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    let report = `Sample Size for ${testTitle}:\t${dateStr} ${timeStr}\n\n`;
    report += `Result:\nSample Size\t${result.sample_size}\n\n`;
    report += `Parameters:\n`;

    // Add parameters based on test type
    switch (testType) {
      case 'ttest-sample-size':
        report += `Expected Difference\t${ttestForm.expected_difference}\n`;
        report += `Expected Standard Deviation\t${ttestForm.expected_std_dev}\n`;
        report += `Desired Power\t${ttestForm.desired_power}\n`;
        report += `Alpha\t${ttestForm.alpha}\n`;
        break;
      
      case 'proportion-sample-size':
        report += `Group 1 Proportion\t${proportionForm.group1_proportion}\n`;
        report += `Group 2 Proportion\t${proportionForm.group2_proportion}\n`;
        report += `Desired Power\t${proportionForm.desired_power}\n`;
        report += `Alpha\t${proportionForm.alpha}\n`;
        report += `Yates Correction\t${proportionForm.yates_correction ? 'Yes' : 'No'}\n`;
        break;
      
      case 'paired-ttest-sample-size':
        report += `Change to be Detected\t${pairedTTestForm.change_to_be_detected}\n`;
        report += `Expected Std Dev of Change\t${pairedTTestForm.expected_std_dev_of_change}\n`;
        report += `Desired Power\t${pairedTTestForm.desired_power}\n`;
        report += `Alpha\t${pairedTTestForm.alpha}\n`;
        report += `Correlation\t${pairedTTestForm.correlation}\n`;
        break;
      
      case 'anova-sample-size':
        report += `Minimum Detectable Difference\t${anovaForm.minimum_detectable_difference}\n`;
        report += `Expected Std Dev of Residuals\t${anovaForm.expected_std_dev_residuals}\n`;
        report += `Number of Groups\t${anovaForm.num_groups}\n`;
        report += `Desired Power\t${anovaForm.desired_power}\n`;
        report += `Alpha\t${anovaForm.alpha}\n`;
        break;
      
      case 'chi-square-sample-size':
        report += `Desired Power\t${chiSquareForm.desired_power}\n`;
        report += `Alpha\t${chiSquareForm.alpha}\n`;
        report += `Yates Correction\t${chiSquareForm.yates_correction ? 'Yes' : 'No'}\n`;
        break;
    }

    return report;
  };

  const saveSampleSizeToProject = async (
    projectId: number,
    projectName: string,
    testTitle: string,
    testType: SampleSizeTestType,
    result: ISampleSizeResult,
    ttestForm: ITTestForm,
    proportionForm: IProportionForm,
    pairedTTestForm: IPairedTTestForm,
    anovaForm: IAnovaForm,
    chiSquareForm: IChiSquareForm
  ) => {
    try {
      // Format the report text
      const reportText = formatSampleSizeReport(
        testTitle,
        testType,
        result,
        ttestForm,
        proportionForm,
        pairedTTestForm,
        anovaForm,
        chiSquareForm
      );

      // Get the project's database path from workspace
      const { projects } = useStartProStore.getState();
      const project = Object.values(projects).find(p => Number(p.id) === projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      const dbName = project.workspacePath || project.id;
      // Create OUTPUT table if it doesn't exist and insert the result
      const db = new Database(dbName);
      
      await db.executeQuery(`
        CREATE TABLE IF NOT EXISTS OUTPUT (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          parameters TEXT NULL,
          result TEXT NULL,
          tabName TEXT NULL,
          outputFor TEXT NULL,
          outputType TEXT NULL,
          modifiedDateTime TEXT NOT NULL
        )
      `, []);

      // Create result object
      const resultObj = {
        sample_size: result.sample_size,
        report_text: reportText,
        test_type: testType,
        test_title: testTitle,
      };

      // Insert into OUTPUT table
      await db.executeQuery(`
        INSERT INTO OUTPUT (parameters, result, tabName, outputFor, outputType, modifiedDateTime)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        JSON.stringify(result.parameters),
        JSON.stringify(resultObj),
        dbName,
        `Sample Size: ${testTitle}`,
        'sampleSize',
        new Date().toISOString()
      ]);

      setBlockUI({ value: true, msg: `Sample size report saved to ${projectName}`, hideOk: false });
      
      // Open the output tab
      openNewTab(project as any, projectId, 'OUTPUT', (key: string) => key);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save sample size report';
      console.error('[Save Sample Size] Error:', errorMsg);
      setBlockUI({ value: true, msg: errorMsg, hideOk: false });
    }
  };

  return {
    saveSampleSizeToProject,
  };
};

