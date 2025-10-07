import { useState } from 'react';
export interface IModal {
  closeModal: () => void;
  open: boolean;
  toggleModal: () => void;
  openModal: () => void;
}
interface IModalInput {
  initialOpen?: boolean;
}
export const useModal = ({ initialOpen }: IModalInput): IModal => {
  const [open, setOpen] = useState<boolean>(initialOpen ?? false);
  const closeModal = (): void => {
    setOpen(false);
  };
  const toggleModal = (): void => {
    setOpen((state) => !state);
  };
  const openModal = (): void => {
    setOpen(true);
  };
  return {
    open,
    closeModal,
    toggleModal,
    openModal,
  };
};
