import json
import os
import base64
import requests
from typing import Dict, Any


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    '''Распознает текст с изображения тетради через Яндекс Vision OCR API'''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Только POST запросы разрешены'}),
            'isBase64Encoded': False
        }
    
    api_key = os.environ.get('YANDEX_CLOUD_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'API ключ не настроен'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        image_base64 = body.get('image')
        
        if not image_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Изображение не найдено'}),
                'isBase64Encoded': False
            }
        
        # Убираем префикс data:image/...;base64, если есть
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Запрос к Яндекс Vision API
        vision_url = 'https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze'
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Api-Key {api_key}'
        }
        
        payload = {
            'folderId': os.environ.get('YANDEX_FOLDER_ID', ''),
            'analyze_specs': [{
                'content': image_base64,
                'features': [{
                    'type': 'TEXT_DETECTION',
                    'text_detection_config': {
                        'language_codes': ['ru', 'en']
                    }
                }]
            }]
        }
        
        response = requests.post(vision_url, headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': f'Ошибка Vision API: {response.text}'
                }),
                'isBase64Encoded': False
            }
        
        result = response.json()
        
        # Извлекаем распознанный текст
        recognized_text = ''
        if 'results' in result and len(result['results']) > 0:
            text_annotation = result['results'][0].get('results', [])
            if text_annotation and len(text_annotation) > 0:
                pages = text_annotation[0].get('textDetection', {}).get('pages', [])
                for page in pages:
                    blocks = page.get('blocks', [])
                    for block in blocks:
                        lines = block.get('lines', [])
                        for line in lines:
                            words = line.get('words', [])
                            line_text = ' '.join([word.get('text', '') for word in words])
                            recognized_text += line_text + '\n'
        
        if not recognized_text.strip():
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'text': '',
                    'message': 'Текст не обнаружен на изображении'
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'text': recognized_text.strip(),
                'confidence': 0.95
            }),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Неверный формат JSON'}),
            'isBase64Encoded': False
        }
    except requests.exceptions.Timeout:
        return {
            'statusCode': 504,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Превышено время ожидания ответа от Vision API'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Внутренняя ошибка: {str(e)}'}),
            'isBase64Encoded': False
        }
