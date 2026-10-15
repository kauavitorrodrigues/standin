import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { CREATE_ASSET_DEFAULT_VALUES } from "../../consts/createForm";
import type { CreateAssetFormValues } from "../../types/createForm";
import { useAssetTypePreset } from "../useAssetTypePreset";

const setup = () =>
    renderHook(() => {
        const form = useForm<CreateAssetFormValues>({
            defaultValues: CREATE_ASSET_DEFAULT_VALUES,
        });
        useAssetTypePreset(form);
        return form;
    });

describe("useAssetTypePreset", () => {
    afterEach(unmountAllHooks);

    it("locks the door setup and gives back what was there before", () => {
        const { result, act } = setup();
        act(() => {
            result.current.setValue("solid", true);
            result.current.setValue("placement", "SURFACE");
        });

        act(() => result.current.setValue("type", "DOOR"));
        expect(result.current.getValues("solid")).toBe(false);
        expect(result.current.getValues("placement")).toBe("GROUND");
        expect(result.current.getValues("isAnimated")).toBe(true);
        expect(result.current.getValues("frameCount")).toBe(4);

        act(() => result.current.setValue("type", "CHAIR"));
        expect(result.current.getValues("solid")).toBe(true);
        expect(result.current.getValues("placement")).toBe("SURFACE");
        expect(result.current.getValues("isAnimated")).toBe(false);
    });
});
