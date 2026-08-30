import {
  validarCorreoPersonal,
  validarCorreoOptExistente,
} from "../src/controller/validarEntradas";

// Mock del cliente de Supabase para no golpear la BD real.
const mockOr = jest.fn();
jest.mock("../src/model/supabase", () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      or: (filtro) => mockOr(filtro),
    })),
  })),
}));

describe("validarCorreoPersonal()", () => {
  test("acepta correos personales válidos (gmail, yahoo, hotmail, outlook)", () => {
    expect(validarCorreoPersonal("juan@gmail.com")).toBe(true);
    expect(validarCorreoPersonal("juan@yahoo.com")).toBe(true);
    expect(validarCorreoPersonal("juan@yahoo.es")).toBe(true);
    expect(validarCorreoPersonal("juan@hotmail.com")).toBe(true);
    expect(validarCorreoPersonal("juan@hotmail.es")).toBe(true);
    expect(validarCorreoPersonal("juan@outlook.com")).toBe(true);
  });

  test("rechaza correos institucionales y formatos inválidos", () => {
    expect(validarCorreoPersonal("juan@estudiantec.cr")).toBe(false);
    expect(validarCorreoPersonal("juan@itcr.ac.cr")).toBe(false);
    expect(validarCorreoPersonal("juan@empresa.com")).toBe(false);
    expect(validarCorreoPersonal("correo-malo")).toBe(false);
    expect(validarCorreoPersonal("a@b@c.com")).toBe(false);
  });
});

describe("validarCorreoOptExistente()", () => {
  test("retorna true cuando el correo opcional está vacío", async () => {
    expect(await validarCorreoOptExistente("", "")).toBe(true);
  });

  test("retorna true si no hay coincidencias en la BD", async () => {
    mockOr.mockResolvedValueOnce({ data: [], error: null });
    expect(await validarCorreoOptExistente("juan@gmail.com", "")).toBe(true);
  });

  test("retorna false si el correo ya existe en otro usuario", async () => {
    mockOr.mockResolvedValueOnce({ data: [{ id: "otro-usuario" }], error: null });
    expect(await validarCorreoOptExistente("juan@gmail.com", "")).toBe(false);
  });

  test("retorna true si la coincidencia es el propio usuario (edición)", async () => {
    mockOr.mockResolvedValueOnce({ data: [{ id: "user-1" }], error: null });
    expect(await validarCorreoOptExistente("juan@gmail.com", "user-1")).toBe(true);
  });

  test("retorna true si hubo error de consulta (deja pasar)", async () => {
    mockOr.mockResolvedValueOnce({ data: null, error: { message: "x" } });
    expect(await validarCorreoOptExistente("juan@gmail.com", "")).toBe(true);
  });
});
