import {IsNotEmpty, IsOptional, IsString, IsUrl} from 'class-validator';

export class CreateUrlDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  short: string;

  @IsNotEmpty()
  @IsUrl()
  full: string;
}