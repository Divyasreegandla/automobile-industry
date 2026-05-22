from pydantic import BaseModel

class ProductionStats(BaseModel):
    total_production_lines: int
    active_production_lines: int
    total_vehicles_in_production: int
    completed_vehicles_today: int
    quality_pass_rate: float
    total_production_cost: float