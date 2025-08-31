"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export default function RecipeStepsForm({ steps, setSteps }) {
  const handleAddStep = () => {
    setSteps((prev) => [...prev, { instruction: "", timer: "", timerUnit: "min", image: null }]);
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const handleRemoveStep = (index) => {
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated);
  };

  return (
    <div className="space-y-4">
      <Label className="text-yellow-500 text-lg">Instructions</Label>

      {steps.map((step, index) => (
        <div
          key={index}
          className="flex items-center gap-2 border rounded-md p-2 flex-wrap"
        >
          <span className="font-bold text-yellow-500 w-6 text-center">{index + 1}</span>
          <Input
            placeholder="Instruction"
            className="flex-1"
            value={step.instruction}
            onChange={(e) => handleStepChange(index, "instruction", e.target.value)}
          />
          <Input
            placeholder="Time"
            type="number"
            min="0"
            className="w-24"
            value={step.timer}
            onChange={(e) => handleStepChange(index, "timer", e.target.value)}
          />
          <select
            className="border rounded-md px-2 py-2 text-sm"
            value={step.timerUnit || "min"}
            onChange={(e) => handleStepChange(index, "timerUnit", e.target.value)}
          >
            <option value="sec">sec</option>
            <option value="min">min</option>
            <option value="hr">hr</option>
          </select>
          <Button
            variant="outline"
            className="text-red-500 border-red-500"
            onClick={() => handleRemoveStep(index)}
          >
            <X className="w-4 h-4" />
          </Button>
          {/* Optionally, add image field if you handle file uploads */}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full border-yellow-500 text-yellow-500"
        onClick={handleAddStep}
      >
        +
      </Button>
    </div>
  );
}
