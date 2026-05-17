<?php

namespace App\Services\Detection;

interface DetectionEngineInterface
{
    public function analyze(array $input): array;
}
