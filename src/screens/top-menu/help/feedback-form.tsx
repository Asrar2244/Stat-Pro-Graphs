import { FC, useState, ChangeEvent, FormEvent } from 'react';
import { Textarea, Button, Field, Spinner, Input } from '@fluentui/react-components';
import { MdStar, MdStarBorder } from 'react-icons/md';
import { useFeedbackStyles } from './styles-hook/use-feedback-styles';
import { useToaster } from '@hooks';
import axios from 'axios';

interface FeedbackFormProps {
    closeModal: () => void;
}

export const FeedbackForm: FC<FeedbackFormProps> = ({ closeModal }) => {
    const styles = useFeedbackStyles();
    const toaster = useToaster();
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [organization, setOrganization] = useState<string>('');
    const [contact, setContact] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);

    const handleRatingClick = (value: number) => {
        setRating(value);
    };

    const handleRatingHover = (value: number) => {
        setHoverRating(value);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'name') setName(value);
        if (name === 'organization') setOrganization(value);
        if (name === 'contact') setContact(value);
        if (name === 'feedback') setFeedback(value);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toaster.info({ body: 'Please provide a star rating before submitting.' });
            return;
        }

        setIsSubmitting(true);
        try {
            // Use Web3Forms API
            // Note: Access key will be provided by user later. Using a placeholder for now.
            const accessKey = 'e7b47055-51b6-4069-bf92-cebd601b85ad';

            const response = await axios.post('https://api.web3forms.com/submit', {
                access_key: accessKey,
                subject: 'New Product Feedback from StatPro',
                rating: rating,
                name: name,
                organization: organization,
                contact: contact,
                feedback: feedback,
                from_name: name || 'StatPro User',
            });

            if (response.data.success) {
                setSubmitted(true);
                toaster.success({ body: 'Thank you for your feedback!' });
                setTimeout(() => {
                    closeModal();
                }, 2000);
            } else {
                throw new Error(response.data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            toaster.error({ body: 'Failed to submit feedback. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className={styles.container}>
                <div className={styles.successMessage}>
                    <h2>Feedback Received!</h2>
                    <p>We appreciate your time and input.</p>
                </div>
            </div>
        );
    }

    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <div className={styles.ratingContainer}>
                <div className={styles.title}>How would you rate StatPro?</div>
                <div className={styles.starsWrapper}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <div
                            key={star}
                            onMouseEnter={() => handleRatingHover(star)}
                            onMouseLeave={() => handleRatingHover(0)}
                            onClick={() => handleRatingClick(star)}
                            className={
                                (hoverRating || rating) >= star ? styles.starActive : styles.starInactive
                            }
                        >
                            {(hoverRating || rating) >= star ? <MdStar /> : <MdStarBorder />}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.formField}>
                <Field label="Name" required>
                    <Input
                        name="name"
                        placeholder="Your Name"
                        value={name}
                        onChange={handleInputChange}
                        required
                    />
                </Field>
            </div>

            <div className={styles.formField}>
                <Field label="Email / Contact Info" required>
                    <Input
                        name="contact"
                        placeholder="Email or Phone Number"
                        value={contact}
                        onChange={handleInputChange}
                        required
                    />
                </Field>
            </div>

            <div className={styles.formField}>
                <Field label="Organization" required>
                    <Input
                        name="organization"
                        placeholder="Company or School Name"
                        value={organization}
                        onChange={handleInputChange}
                        required
                    />
                </Field>
            </div>

            <div className={styles.formField}>
                <Field label="Review" required>
                    <Textarea
                        name="feedback"
                        placeholder="Share your review, thoughts, or report any issues..."
                        value={feedback}
                        onChange={handleInputChange}
                        className={styles.textarea}
                        required
                    />
                </Field>
            </div>

            <Button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || rating === 0}
            >
                {isSubmitting ? <Spinner size="tiny" label="Submitting..." /> : 'Submit Review'}
            </Button>
        </form>
    );
};
