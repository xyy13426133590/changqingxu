import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class CustomClassValidationPipe implements PipeTransform {
    transform(value: unknown, { metatype }: ArgumentMetadata): Promise<any>;
    private toValidate;
}
