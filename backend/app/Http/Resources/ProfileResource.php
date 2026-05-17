<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'full_name' => $this->full_name,
            'gender' => $this->gender,
            'age' => $this->age,
            'plan_type' => $this->plan_type,
            'subscription_status' => $this->subscription_status,
            'subscription_started_at' => $this->subscription_started_at?->toDateTimeString(),
            'subscription_expires_at' => $this->subscription_expires_at?->toDateTimeString(),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
