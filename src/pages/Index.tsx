import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import LoginForm from '@/components/LoginForm';
import Header from '@/components/Header';

interface CheckResult {
  id: string;
  fileName: string;
  studentName: string;
  grade: number;
  errorsCount: number;
  timestamp: Date;
  errors: {
    type: 'spelling' | 'grammar' | 'punctuation';
    text: string;
    suggestion: string;
    position: number;
  }[];
  recognizedText: string;
}

const Index = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<CheckResult | null>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setIsProcessing(true);

      setTimeout(() => {
        const mockResult: CheckResult = {
          id: Date.now().toString(),
          fileName: file.name,
          studentName: 'Иванов Петр',
          grade: 4,
          errorsCount: 3,
          timestamp: new Date(),
          recognizedText: 'Наступила осень. Листя пожелтели и опали с деревьев. Птицы улитают на юг.',
          errors: [
            {
              type: 'spelling',
              text: 'Листя',
              suggestion: 'Листья',
              position: 17
            },
            {
              type: 'spelling',
              text: 'улитают',
              suggestion: 'улетают',
              position: 62
            },
            {
              type: 'punctuation',
              text: 'деревьев',
              suggestion: 'деревьев,',
              position: 50
            }
          ]
        };

        setResults(prev => [mockResult, ...prev]);
        setSelectedResult(mockResult);
        setIsProcessing(false);
        
        toast({
          title: '✅ Проверка завершена',
          description: `Найдено ошибок: ${mockResult.errorsCount}. Оценка: ${mockResult.grade}`,
        });
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const exportResults = () => {
    if (!selectedResult) return;

    const reportText = `
ОТЧЕТ О ПРОВЕРКЕ ТЕТРАДИ
========================
Ученик: ${selectedResult.studentName}
Дата: ${selectedResult.timestamp.toLocaleDateString()}
Оценка: ${selectedResult.grade}
Найдено ошибок: ${selectedResult.errorsCount}

РАСПОЗНАННЫЙ ТЕКСТ:
${selectedResult.recognizedText}

ОШИБКИ:
${selectedResult.errors.map((err, i) => `${i + 1}. ${err.text} → ${err.suggestion} (${err.type})`).join('\n')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `отчет_${selectedResult.studentName}_${Date.now()}.txt`;
    a.click();

    toast({
      title: '📥 Отчет загружен',
      description: 'Результаты проверки сохранены в файл',
    });
  };

  const getGradeColor = (grade: number) => {
    if (grade === 5) return 'bg-green-500';
    if (grade === 4) return 'bg-blue-500';
    if (grade === 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getErrorTypeLabel = (type: string) => {
    const labels = {
      spelling: 'Орфография',
      grammar: 'Грамматика',
      punctuation: 'Пунктуация'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header teacherName={teacherName} teacherEmail={teacherEmail} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать, {teacherName}!
          </h2>
          <p className="text-lg text-gray-600">
            Проверьте письменные работы обучающихся с помощью ИИ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Upload" size={24} />
                  Загрузка фотографии
                </CardTitle>
                <CardDescription>
                  Загрузите фото тетради для автоматической проверки
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
                    ${isDragging ? 'border-primary bg-blue-50 scale-105' : 'border-gray-300 hover:border-primary'}
                    ${uploadedImage ? 'bg-gray-50' : ''}
                  `}
                >
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="max-h-64 mx-auto rounded-lg shadow-md"
                      />
                      {isProcessing && (
                        <div className="space-y-2">
                          <Progress value={66} className="w-full" />
                          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                            <Icon name="Loader2" size={16} className="animate-spin" />
                            Распознавание текста...
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Icon name="ImagePlus" size={48} className="mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Перетащите фото сюда
                        </p>
                        <p className="text-sm text-gray-500 mb-4">или</p>
                        <label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Button variant="outline" className="cursor-pointer" asChild>
                            <span>
                              <Icon name="FolderOpen" size={18} className="mr-2" />
                              Выберите файл
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {uploadedImage && !isProcessing && (
                  <Button
                    onClick={() => {
                      setUploadedImage(null);
                      setSelectedResult(null);
                    }}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    <Icon name="RotateCcw" size={18} className="mr-2" />
                    Загрузить другую фотографию
                  </Button>
                )}
              </CardContent>
            </Card>

            {results.length > 0 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="History" size={24} />
                    История проверок ({results.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {results.map(result => (
                    <div
                      key={result.id}
                      onClick={() => setSelectedResult(result)}
                      className={`
                        p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                        ${selectedResult?.id === result.id ? 'border-primary bg-blue-50' : 'border-gray-200'}
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{result.studentName}</span>
                        <Badge className={`${getGradeColor(result.grade)} text-white`}>
                          Оценка: {result.grade}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Icon name="AlertCircle" size={14} />
                          {result.errorsCount} ошибок
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {selectedResult ? (
              <>
                <Card className="animate-slide-in-right">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="FileText" size={24} />
                        Результаты проверки
                      </CardTitle>
                      <Badge className={`${getGradeColor(selectedResult.grade)} text-white text-lg px-4 py-2`}>
                        {selectedResult.grade}
                      </Badge>
                    </div>
                    <CardDescription>
                      {selectedResult.studentName} • {selectedResult.timestamp.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="errors" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="errors">
                          <Icon name="AlertTriangle" size={16} className="mr-2" />
                          Ошибки ({selectedResult.errorsCount})
                        </TabsTrigger>
                        <TabsTrigger value="text">
                          <Icon name="FileText" size={16} className="mr-2" />
                          Текст
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="errors" className="space-y-3 mt-4">
                        {selectedResult.errors.length > 0 ? (
                          selectedResult.errors.map((error, index) => (
                            <Alert key={index} className="border-l-4 border-l-red-500">
                              <Icon name="AlertCircle" size={18} />
                              <AlertDescription>
                                <div className="ml-2">
                                  <Badge variant="secondary" className="mb-2">
                                    {getErrorTypeLabel(error.type)}
                                  </Badge>
                                  <p className="font-medium">
                                    <span className="line-through text-red-600">{error.text}</span>
                                    {' → '}
                                    <span className="text-green-600">{error.suggestion}</span>
                                  </p>
                                </div>
                              </AlertDescription>
                            </Alert>
                          ))
                        ) : (
                          <Alert className="border-l-4 border-l-green-500">
                            <Icon name="CheckCircle2" size={18} />
                            <AlertDescription className="ml-2">
                              Ошибок не найдено! Отличная работа!
                            </AlertDescription>
                          </Alert>
                        )}
                      </TabsContent>

                      <TabsContent value="text" className="mt-4">
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {selectedResult.recognizedText}
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button onClick={exportResults} className="w-full mt-6" size="lg">
                      <Icon name="Download" size={20} className="mr-2" />
                      Экспортировать отчет
                    </Button>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="BarChart3" size={24} />
                      Статистика
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {selectedResult.grade}
                        </div>
                        <div className="text-sm text-gray-600">Оценка</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-secondary mb-1">
                          {selectedResult.errorsCount}
                        </div>
                        <div className="text-sm text-gray-600">Ошибок</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Орфография</span>
                        <span className="font-medium">
                          {selectedResult.errors.filter(e => e.type === 'spelling').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Пунктуация</span>
                        <span className="font-medium">
                          {selectedResult.errors.filter(e => e.type === 'punctuation').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Грамматика</span>
                        <span className="font-medium">
                          {selectedResult.errors.filter(e => e.type === 'grammar').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-96">
                <CardContent className="text-center py-12">
                  <Icon name="FileSearch" size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-lg text-gray-500">
                    Загрузите фотографию тетради для начала проверки
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;