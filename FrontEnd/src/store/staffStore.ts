import { create } from "zustand";

interface StaffState {
  /** Quando true, os itens de navegacao (Inicio/Jogar/Historico/Conquistas) ficam visiveis. */
  isStaff: boolean;
  /** Quando true, o modal de senha esta aberto. */
  isPasswordModalOpen: boolean;
  enableStaff: () => void;
  disableStaff: () => void;
  openPasswordModal: () => void;
  closePasswordModal: () => void;
}

/**
 * Store que controla o "modo funcionario".
 *
 * Por padrao o modo e desabilitado, ou seja, o jogador comum NAO ve os
 * botoes de navegacao no header. Para ativar, o funcionario clica 5 vezes
 * no icone do tigre (canto superior esquerdo) e digita a senha 123456 no
 * teclado numerico que aparece em tela.
 *
 * O estado NAO e persistido propositalmente: a cada reload o modo volta a
 * ficar oculto, garantindo que o jogador nunca tenha acesso por engano.
 */
export const useStaffStore = create<StaffState>((set) => ({
  isStaff: false,
  isPasswordModalOpen: false,
  enableStaff: () => set({ isStaff: true, isPasswordModalOpen: false }),
  disableStaff: () => set({ isStaff: false }),
  openPasswordModal: () => set({ isPasswordModalOpen: true }),
  closePasswordModal: () => set({ isPasswordModalOpen: false }),
}));

/** Senha unica de liberacao do modo funcionario. */
export const STAFF_PASSWORD = "123456";
