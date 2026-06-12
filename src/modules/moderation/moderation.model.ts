import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class RejectSubmissionDTO {
  @IsString()
  @IsNotEmpty({ message: "A rejection reason is required" })
  @MaxLength(1000)
  reason!: string;
}
